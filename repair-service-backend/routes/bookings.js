const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { repairDbPool } = require('../db');
const { sendConfirmationEmail } = require('../utils/mailer');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 }
});

// Function to clean up uploaded files
const cleanupFiles = (files) => {
  if (files && files.length > 0) {
    files.forEach(file => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          console.log(`Cleaned up file: ${file.path}`);
        }
      } catch (err) {
        console.error(`Failed to cleanup file ${file.path}:`, err);
      }
    });
  }
};

// POST /api/bookings
router.post('/', upload.array('images', 3), async (req, res) => {
  console.log('Booking request received:', req.body);
  console.log('Files received:', req.files);

  const {
    deviceType, deviceBrand, deviceModel,
    issueDescription, fullName, email, phone,
    address, preferredDate, preferredTime, serviceType
  } = req.body;

  if (!fullName || !email || !phone || !preferredDate || !preferredTime || !serviceType) {
    return res.status(400).json({
      success: false,
      message: 'Please fill in all required fields'
    });
  }

  const client = await repairDbPool.connect();

  try {
    // Start transaction
    await client.query('BEGIN');
    
    // Insert booking
    const insertBooking = await client.query(`
      INSERT INTO bookings (
        device_type, device_brand, device_model, issue_description,
        full_name, email, phone, address,
        preferred_date, preferred_time, service_type
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING id
    `, [
      deviceType, deviceBrand, deviceModel, issueDescription,
      fullName, email, phone, address,
      preferredDate, preferredTime, serviceType
    ]);

    const bookingId = insertBooking.rows[0].id;

    // Handle file uploads within transaction
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const publicPath = `/uploads/${file.filename}`;
        await client.query(
          `INSERT INTO booking_images 
            (booking_id, file_path, original_name, file_size, image_path) 
           VALUES ($1, $2, $3, $4, $5)`,
          [bookingId, file.path, file.originalname, file.size, publicPath]
        );
        uploadedImages.push({
          name: file.originalname,
          size: Math.round(file.size / 1024) + ' KB'
        });
      }
    }

    // Commit transaction
    await client.query('COMMIT');

    // Send emails (outside transaction since email failure shouldn't roll back booking)
    try {
      // Send confirmation email to customer
      await sendConfirmationEmail(
        email,
        'Repair Booking Confirmation',
        `
          <h2>Hi ${fullName},</h2>
          <p>Your repair booking has been received. We'll contact you shortly to confirm the details.</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>Booking Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 5px 0;"><strong>Booking ID:</strong> #${bookingId}</li>
              <li style="margin: 5px 0;"><strong>Device:</strong> ${deviceBrand || 'Not specified'} ${deviceModel || ''}</li>
              <li style="margin: 5px 0;"><strong>Device Type:</strong> ${deviceType || 'Not specified'}</li>
              <li style="margin: 5px 0;"><strong>Issue:</strong> ${issueDescription || 'Not specified'}</li>
              <li style="margin: 5px 0;"><strong>Service Type:</strong> ${serviceType}</li>
              <li style="margin: 5px 0;"><strong>Preferred Date:</strong> ${preferredDate}</li>
              <li style="margin: 5px 0;"><strong>Preferred Time:</strong> ${preferredTime}</li>
              ${address ? `<li style="margin: 5px 0;"><strong>Address:</strong> ${address}</li>` : ''}
              ${uploadedImages.length > 0 ? `<li style="margin: 5px 0;"><strong>Images Uploaded:</strong> ${uploadedImages.length} file(s)</li>` : ''}
            </ul>
          </div>

          <p><strong>What happens next?</strong></p>
          <ul>
            <li>We'll review your booking details</li>
            <li>Our team will contact you within 24 hours to confirm</li>
            <li>We'll provide a quote and estimated repair time</li>
          </ul>

          <p>If you have any urgent questions, please call us at: <strong>${process.env.BUSINESS_PHONE || '0735270565'}</strong></p>
          
          <p>Thank you for choosing <strong>Stentech Repairs</strong>!</p>
        `
      );
      console.log('Customer booking confirmation email sent successfully');

      // Send notification email to admin/business
      const notificationEmail = process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER;
      if (notificationEmail) {
        await sendConfirmationEmail(
          notificationEmail,
          `New Repair Booking Received - #${bookingId}`,
          `
            <h2>🔧 New Repair Booking Received</h2>
            <p style="color: #28a745; font-weight: bold;">A new repair booking has been submitted and requires your attention.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #007bff;">
              <h3 style="color: #007bff; margin-top: 0;">Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong>Booking ID:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">#${bookingId}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong>Customer:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">${fullName}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong>Email:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><a href="mailto:${email}">${email}</a></td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong>Phone:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><a href="tel:${phone}">${phone}</a></td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong>Service Type:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><span style="background: #e3f2fd; padding: 2px 8px; border-radius: 4px;">${serviceType}</span></td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong>Preferred Date:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">${preferredDate}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong>Preferred Time:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">${preferredTime}</td></tr>
                ${address ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong>Address:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">${address}</td></tr>` : ''}
              </table>
            </div>

            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;">
              <h4 style="color: #856404; margin-top: 0;">Device Information</h4>
              <p><strong>Type:</strong> ${deviceType || 'Not specified'}</p>
              <p><strong>Brand:</strong> ${deviceBrand || 'Not specified'}</p>
              <p><strong>Model:</strong> ${deviceModel || 'Not specified'}</p>
              <div style="background: white; padding: 10px; border-radius: 3px; margin: 10px 0;">
                <strong>Issue Description:</strong><br>
                ${issueDescription || 'No description provided'}
              </div>
            </div>

            ${uploadedImages.length > 0 ? `
            <div style="background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #17a2b8;">
              <h4 style="color: #0c5460; margin-top: 0;">📷 Uploaded Images (${uploadedImages.length})</h4>
              <ul>
                ${uploadedImages.map(img => `<li>${img.name} (${img.size})</li>`).join('')}
              </ul>
              <p style="font-size: 12px; color: #6c757d;">Images are stored in the uploads directory</p>
            </div>
            ` : ''}

            <div style="background: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #dc3545;">
              <h4 style="color: #721c24; margin-top: 0;">⚡ Action Required</h4>
              <ul>
                <li>Contact the customer within 24 hours</li>
                <li>Assess the device issue and provide a quote</li>
                <li>Schedule the repair appointment</li>
                <li>Update booking status in the system</li>
              </ul>
            </div>

            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            <hr>
            <p style="color: #6c757d; font-size: 12px;">This notification was automatically generated by your Stentech Repairs booking system.</p>
          `
        );
        console.log('Admin booking notification email sent successfully');
      }

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the entire booking if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Booking submitted successfully',
      bookingId: bookingId
    });

  } catch (error) {
    console.error('Error submitting booking:', error);
    
    // Rollback transaction
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
    }

    // Clean up uploaded files if booking failed
    cleanupFiles(req.files);

    res.status(500).json({
      success: false,
      message: 'Booking failed: ' + error.message
    });
  } finally {
    client.release();
  }
});

// GET /api/bookings/:bookingId/images - Retrieve images for a specific booking
router.get('/:bookingId/images', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Validate bookingId is a number
    if (!bookingId || isNaN(parseInt(bookingId))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const result = await repairDbPool.query(
      'SELECT * FROM booking_images WHERE booking_id = $1 ORDER BY uploaded_at DESC',
      [parseInt(bookingId)]
    );

    res.json({ 
      success: true, 
      images: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching booking images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking images'
    });
  }
});

// GET /api/bookings
router.get('/', async (req, res) => {
  try {
    const result = await repairDbPool.query(`
      SELECT * FROM bookings ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      bookings: result.rows
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// Add this to your bookings.js file (or create a separate customer routes file)

// GET /api/bookings/customer/:identifier - Get bookings for a specific customer
router.get('/customer/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    console.log('=== CUSTOMER BOOKINGS LOOKUP ===');
    console.log('Identifier:', identifier);
    
    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Customer identifier is required'
      });
    }

    // Try to find bookings using different customer fields
    const queries = [
      // Try email first (most common)
      {
        query: 'SELECT * FROM bookings WHERE LOWER(email) = LOWER($1) ORDER BY created_at DESC',
        params: [identifier],
        method: 'email'
      },
      // Try full name
      {
        query: 'SELECT * FROM bookings WHERE LOWER(full_name) = LOWER($1) ORDER BY created_at DESC',
        params: [identifier],
        method: 'full_name'
      },
      // Try phone number
      {
        query: 'SELECT * FROM bookings WHERE phone = $1 ORDER BY created_at DESC',
        params: [identifier],
        method: 'phone'
      },
      // Try partial name match
      {
        query: 'SELECT * FROM bookings WHERE LOWER(full_name) LIKE LOWER($1) ORDER BY created_at DESC',
        params: [`%${identifier}%`],
        method: 'partial_name'
      }
    ];

    let bookings = [];
    let successMethod = null;
    let customerInfo = null;

    // Try each query until we find matches
    for (const { query, params, method } of queries) {
      try {
        console.log(`Trying method: ${method}`);
        console.log(`Query: ${query}`);
        console.log(`Params:`, params);
        
        const result = await repairDbPool.query(query, params);
        
        if (result.rows.length > 0) {
          bookings = result.rows;
          successMethod = method;
          
          // Extract customer info from first booking
          const firstBooking = result.rows[0];
          customerInfo = {
            name: firstBooking.full_name,
            email: firstBooking.email,
            phone: firstBooking.phone,
            address: firstBooking.address
          };
          
          console.log(`Found ${bookings.length} bookings using method: ${method}`);
          break;
        }
      } catch (queryError) {
        console.error(`Query error with method ${method}:`, queryError);
        continue;
      }
    }

    // If still no bookings found, try a broader search
    if (bookings.length === 0) {
      try {
        console.log('Trying broader search...');
        const broadQuery = `
          SELECT * FROM bookings 
          WHERE LOWER(email) LIKE LOWER($1) 
             OR LOWER(full_name) LIKE LOWER($1)
             OR phone LIKE $1
          ORDER BY created_at DESC
        `;
        const broadResult = await repairDbPool.query(broadQuery, [`%${identifier}%`]);
        
        if (broadResult.rows.length > 0) {
          bookings = broadResult.rows;
          successMethod = 'broad_search';
          
          const firstBooking = broadResult.rows[0];
          customerInfo = {
            name: firstBooking.full_name,
            email: firstBooking.email,
            phone: firstBooking.phone,
            address: firstBooking.address
          };
          
          console.log(`Found ${bookings.length} bookings using broad search`);
        }
      } catch (broadError) {
        console.error('Broad search error:', broadError);
      }
    }

    // Transform bookings to include additional computed fields
    const transformedBookings = bookings.map(booking => ({
      ...booking,
      // Add computed status if not present
      status: booking.status || 'pending',
      // Ensure consistent date format
      dateSubmitted: booking.created_at,
      // Map service type for display
      serviceTypeDisplay: booking.service_type ? 
        booking.service_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
        'In-Store',
      // Add estimated completion based on preferred date if no actual completion
      estimatedCompletion: booking.preferred_date,
      // Device display name
      deviceDisplayName: [booking.device_brand, booking.device_model].filter(Boolean).join(' ') || 'Unknown Device'
    }));

    const response = {
      success: true,
      repairs: transformedBookings, // Use 'repairs' key for frontend compatibility
      bookings: transformedBookings,
      customerInfo,
      debug: {
        identifier,
        searchMethod: successMethod,
        bookingsFound: bookings.length,
        tableUsed: 'bookings'
      }
    };

    console.log('Returning response:', {
      success: true,
      bookingsCount: transformedBookings.length,
      method: successMethod
    });

    res.json(response);

  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer bookings: ' + error.message,
      debug: {
        error: error.message,
        identifier: req.params.identifier
      }
    });
  }
});

// Alternative endpoint for consistency
router.get('/customer/:identifier/bookings', async (req, res) => {
  // Redirect to the main customer bookings endpoint
  req.url = `/customer/${req.params.identifier}`;
  return router.handle(req, res);
});

// Also add this to support the customer-specific endpoint pattern
// GET /api/customer/bookings/:identifier
const createCustomerBookingsRouter = () => {
  const customerRouter = express.Router();
  
  customerRouter.get('/bookings/:identifier', async (req, res) => {
    try {
      const { identifier } = req.params;
      
      console.log('=== CUSTOMER BOOKINGS LOOKUP (Customer Route) ===');
      console.log('Identifier:', identifier);
      
      if (!identifier) {
        return res.status(400).json({
          success: false,
          message: 'Customer identifier is required'
        });
      }

      // Similar logic as above but from customer perspective
      const queries = [
        {
          query: 'SELECT * FROM bookings WHERE LOWER(email) = LOWER($1) ORDER BY created_at DESC',
          params: [identifier],
          method: 'email'
        },
        {
          query: 'SELECT * FROM bookings WHERE LOWER(full_name) = LOWER($1) ORDER BY created_at DESC',
          params: [identifier],
          method: 'full_name'
        },
        {
          query: 'SELECT * FROM bookings WHERE phone = $1 ORDER BY created_at DESC',
          params: [identifier],
          method: 'phone'
        }
      ];

      let bookings = [];
      let successMethod = null;
      let customerInfo = null;

      for (const { query, params, method } of queries) {
        try {
          const result = await repairDbPool.query(query, params);
          
          if (result.rows.length > 0) {
            bookings = result.rows;
            successMethod = method;
            
            const firstBooking = result.rows[0];
            customerInfo = {
              name: firstBooking.full_name,
              email: firstBooking.email,
              phone: firstBooking.phone,
              address: firstBooking.address
            };
            
            break;
          }
        } catch (queryError) {
          console.error(`Query error with method ${method}:`, queryError);
          continue;
        }
      }

      const transformedBookings = bookings.map(booking => ({
        ...booking,
        status: booking.status || 'pending',
        dateSubmitted: booking.created_at,
        serviceTypeDisplay: booking.service_type ? 
          booking.service_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
          'In-Store',
        estimatedCompletion: booking.preferred_date,
        deviceDisplayName: [booking.device_brand, booking.device_model].filter(Boolean).join(' ') || 'Unknown Device'
      }));

      res.json({
        success: true,
        repairs: transformedBookings,
        bookings: transformedBookings,
        customerInfo,
        debug: {
          identifier,
          searchMethod: successMethod,
          bookingsFound: bookings.length,
          tableUsed: 'bookings',
          route: 'customer'
        }
      });

    } catch (error) {
      console.error('Error fetching customer bookings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customer bookings: ' + error.message
      });
    }
  });
  
  return customerRouter;
};

// Export both the main router and the customer router
module.exports = router;
module.exports.createCustomerBookingsRouter = createCustomerBookingsRouter;

module.exports = router;