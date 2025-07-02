// routes/repairs.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { repairDbPool, customersDbPool } = require('../db');

const router = express.Router();

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
}

// Helper function to check if table exists
async function tableExists(pool, tableName) {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName]);
    return result.rows[0].exists;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

// GET /api/repairs/customer/:identifier - Get repairs for a specific customer
router.get('/customer/:identifier', async (req, res) => {
  const identifier = req.params.identifier;
  
  console.log('=== CUSTOMER REPAIRS REQUEST ===');
  console.log('Identifier:', identifier);

  try {
    // First, try to find the customer in the customers database
    let customerInfo = null;
    let customerId = null;

    const customerClient = await customersDbPool.connect();
    
    try {
      // Try to find customer by different identifiers
      const customerQueries = [
        // Try by email
        { query: 'SELECT * FROM customers WHERE email = $1', param: identifier },
        // Try by username  
        { query: 'SELECT * FROM customers WHERE username = $1', param: identifier },
        // Try by ID (if identifier is numeric)
        ...(isNaN(identifier) ? [] : [{ query: 'SELECT * FROM customers WHERE id = $1', param: parseInt(identifier) }])
      ];

      for (const queryObj of customerQueries) {
        console.log('Trying customer query:', queryObj.query, 'with param:', queryObj.param);
        const result = await customerClient.query(queryObj.query, [queryObj.param]);
        
        if (result.rows.length > 0) {
          customerInfo = result.rows[0];
          customerId = customerInfo.id;
          console.log('Found customer:', { id: customerId, email: customerInfo.email, username: customerInfo.username });
          break;
        }
      }
    } finally {
      customerClient.release();
    }

    if (!customerInfo) {
      console.log('Customer not found in customers database');
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
        debug: {
          identifier: identifier,
          searchAttempts: 'Searched by email, username, and ID'
        }
      });
    }

    // Now search for bookings/repairs using customer information
    const repairClient = await repairDbPool.connect();
    let repairs = [];
    let searchResults = [];

    try {
      // Check if bookings table exists
      const bookingsExists = await tableExists(repairDbPool, 'bookings');
      console.log('Bookings table exists:', bookingsExists);

      if (!bookingsExists) {
        return res.status(500).json({
          success: false,
          message: 'Bookings table not found in database',
          debug: {
            customerFound: true,
            customerInfo: {
              id: customerInfo.id,
              email: customerInfo.email,
              username: customerInfo.username
            }
          }
        });
      }

      // Check if booking_images table exists for image support
      const imagesTableExists = await tableExists(repairDbPool, 'booking_images');
      
      // Define search strategies for bookings
      const searchStrategies = [
        // Search by customer email
        {
          description: 'Search bookings by customer email',
          query: `
            SELECT 
              b.*,
              ${imagesTableExists ? `
                COALESCE(
                  json_agg(
                    json_build_object(
                      'id', bi.id,
                      'image_path', bi.image_path,
                      'original_name', bi.original_name,
                      'file_size', bi.file_size,
                      'uploaded_at', bi.uploaded_at
                    )
                  ) FILTER (WHERE bi.id IS NOT NULL), 
                  '[]'::json
                ) as images
              ` : `'[]'::json as images`}
            FROM bookings b
            ${imagesTableExists ? 'LEFT JOIN booking_images bi ON b.id = bi.booking_id' : ''}
            WHERE b.email = $1
            ${imagesTableExists ? 'GROUP BY b.id' : ''}
            ORDER BY b.created_at DESC
          `,
          param: customerInfo.email
        },
        
        // Search by customer phone if available
        ...(customerInfo.phone ? [{
          description: 'Search bookings by customer phone',
          query: `
            SELECT 
              b.*,
              ${imagesTableExists ? `
                COALESCE(
                  json_agg(
                    json_build_object(
                      'id', bi.id,
                      'image_path', bi.image_path,
                      'original_name', bi.original_name,
                      'file_size', bi.file_size,
                      'uploaded_at', bi.uploaded_at
                    )
                  ) FILTER (WHERE bi.id IS NOT NULL), 
                  '[]'::json
                ) as images
              ` : `'[]'::json as images`}
            FROM bookings b
            ${imagesTableExists ? 'LEFT JOIN booking_images bi ON b.id = bi.booking_id' : ''}
            WHERE b.phone = $1
            ${imagesTableExists ? 'GROUP BY b.id' : ''}
            ORDER BY b.created_at DESC
          `,
          param: customerInfo.phone
        }] : []),

        // Search by customer name (fuzzy match)
        {
          description: 'Search bookings by customer name',
          query: `
            SELECT 
              b.*,
              ${imagesTableExists ? `
                COALESCE(
                  json_agg(
                    json_build_object(
                      'id', bi.id,
                      'image_path', bi.image_path,
                      'original_name', bi.original_name,
                      'file_size', bi.file_size,
                      'uploaded_at', bi.uploaded_at
                    )
                  ) FILTER (WHERE bi.id IS NOT NULL), 
                  '[]'::json
                ) as images
              ` : `'[]'::json as images`}
            FROM bookings b
            ${imagesTableExists ? 'LEFT JOIN booking_images bi ON b.id = bi.booking_id' : ''}
            WHERE b.full_name ILIKE $1 OR b.full_name ILIKE $2
            ${imagesTableExists ? 'GROUP BY b.id' : ''}
            ORDER BY b.created_at DESC
          `,
          param: `%${customerInfo.first_name}%`,
          param2: `%${customerInfo.surname}%`
        }
      ];

      // Execute each search strategy
      for (const strategy of searchStrategies) {
        try {
          console.log(`Executing strategy: ${strategy.description}`);
          
          let result;
          if (strategy.param2) {
            result = await repairClient.query(strategy.query, [strategy.param, strategy.param2]);
          } else {
            result = await repairClient.query(strategy.query, [strategy.param]);
          }
          
          searchResults.push({
            strategy: strategy.description,
            resultCount: result.rows.length,
            success: true
          });

          if (result.rows.length > 0) {
            // Format the booking data to match expected repair structure
            const formattedBookings = result.rows.map(booking => ({
              id: booking.id,
              bookingId: booking.id,
              deviceType: booking.device_type,
              deviceBrand: booking.device_brand,
              deviceModel: booking.device_model,
              issueDescription: booking.issue_description,
              customerName: booking.full_name,
              customerEmail: booking.email,
              customerPhone: booking.phone,
              address: booking.address,
              dateSubmitted: booking.preferred_date,
              preferredTime: booking.preferred_time,
              serviceType: booking.service_type,
              status: booking.status || 'Pending',
              createdAt: booking.created_at,
              updatedAt: booking.updated_at,
              images: booking.images || [],
              source: 'bookings'
            }));
            
            repairs.push(...formattedBookings);
            console.log(`Found ${result.rows.length} bookings from strategy: ${strategy.description}`);
          }
        } catch (queryError) {
          console.error(`Error in strategy ${strategy.description}:`, queryError);
          searchResults.push({
            strategy: strategy.description,
            error: queryError.message,
            success: false
          });
        }
      }

      // Remove duplicates based on ID
      const uniqueRepairs = repairs.filter((repair, index, self) => 
        index === self.findIndex(r => r.id === repair.id)
      );

      console.log(`Total unique repairs found: ${uniqueRepairs.length}`);

      res.json({
        success: true,
        repairs: uniqueRepairs,
        customerInfo: {
          id: customerInfo.id,
          name: `${customerInfo.first_name} ${customerInfo.surname}`,
          email: customerInfo.email,
          phone: customerInfo.phone,
          username: customerInfo.username
        },
        debug: {
          identifier: identifier,
          customerId: customerId,
          searchStrategies: searchResults,
          totalRepairsFound: uniqueRepairs.length,
          imagesSupported: imagesTableExists,
          bookingsTableExists: bookingsExists
        }
      });

    } finally {
      repairClient.release();
    }

  } catch (error) {
    console.error('=== REPAIR FETCH ERROR ===');
    console.error('Error details:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching repairs',
      error: error.message,
      debug: {
        identifier: identifier,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// GET /api/repairs/my-repairs - Get repairs for authenticated customer
router.get('/my-repairs', authenticateToken, async (req, res) => {
  try {
    console.log('=== AUTHENTICATED REPAIR REQUEST ===');
    console.log('User from token:', req.user);

    // Use the customer ID from the JWT token
    const customerId = req.user.id;
    
    // Get customer info from customers database
    const customerClient = await customersDbPool.connect();
    let customerInfo;
    
    try {
      const customerResult = await customerClient.query(
        'SELECT * FROM customers WHERE id = $1',
        [customerId]
      );
      
      if (customerResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }
      
      customerInfo = customerResult.rows[0];
    } finally {
      customerClient.release();
    }

    // Check if bookings table exists
    const bookingsExists = await tableExists(repairDbPool, 'bookings');
    if (!bookingsExists) {
      return res.status(500).json({
        success: false,
        message: 'Bookings table not found in database'
      });
    }

    // Check if booking_images table exists
    const imagesTableExists = await tableExists(repairDbPool, 'booking_images');

    // Now fetch bookings using the customer's email
    const repairClient = await repairDbPool.connect();
    
    try {
      const bookingResult = await repairClient.query(`
        SELECT 
          b.*,
          ${imagesTableExists ? `
            COALESCE(
              json_agg(
                json_build_object(
                  'id', bi.id,
                  'image_path', bi.image_path,
                  'original_name', bi.original_name,
                  'file_size', bi.file_size,
                  'uploaded_at', bi.uploaded_at
                )
              ) FILTER (WHERE bi.id IS NOT NULL), 
              '[]'::json
            ) as images
          ` : `'[]'::json as images`}
        FROM bookings b
        ${imagesTableExists ? 'LEFT JOIN booking_images bi ON b.id = bi.booking_id' : ''}
        WHERE b.email = $1 
        ${imagesTableExists ? 'GROUP BY b.id' : ''}
        ORDER BY b.created_at DESC
      `, [customerInfo.email]);

      // Format the booking data
      const formattedRepairs = bookingResult.rows.map(booking => ({
        id: booking.id,
        bookingId: booking.id,
        deviceType: booking.device_type,
        deviceBrand: booking.device_brand,
        deviceModel: booking.device_model,
        issueDescription: booking.issue_description,
        customerName: booking.full_name,
        customerEmail: booking.email,
        customerPhone: booking.phone,
        address: booking.address,
        dateSubmitted: booking.preferred_date,
        preferredTime: booking.preferred_time,
        serviceType: booking.service_type,
        status: booking.status || 'Pending',
        createdAt: booking.created_at,
        updatedAt: booking.updated_at,
        images: booking.images || []
      }));

      res.json({
        success: true,
        repairs: formattedRepairs,
        customerInfo: {
          id: customerInfo.id,
          name: `${customerInfo.first_name} ${customerInfo.surname}`,
          email: customerInfo.email,
          phone: customerInfo.phone,
          username: customerInfo.username
        },
        debug: {
          imagesSupported: imagesTableExists,
          bookingsFound: formattedRepairs.length
        }
      });

    } finally {
      repairClient.release();
    }

  } catch (error) {
    console.error('Error fetching authenticated user repairs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching repairs',
      error: error.message
    });
  }
});

// GET /api/repairs - Get all repairs (admin/general endpoint)
router.get('/', async (req, res) => {
  try {
    // Check if bookings table exists
    const bookingsExists = await tableExists(repairDbPool, 'bookings');
    if (!bookingsExists) {
      return res.status(500).json({
        success: false,
        message: 'Bookings table not found in database'
      });
    }

    // Check if booking_images table exists
    const imagesTableExists = await tableExists(repairDbPool, 'booking_images');

    const result = await repairDbPool.query(`
      SELECT 
        b.*,
        ${imagesTableExists ? `
          COALESCE(
            json_agg(
              json_build_object(
                'id', bi.id,
                'image_path', bi.image_path,
                'image_name', bi.image_name,
                'image_size', bi.image_size,
                'mime_type', bi.mime_type,
                'uploaded_at', bi.uploaded_at
              )
            ) FILTER (WHERE bi.id IS NOT NULL), 
            '[]'::json
          ) as images
        ` : `'[]'::json as images`}
      FROM bookings b
      ${imagesTableExists ? 'LEFT JOIN booking_images bi ON b.id = bi.booking_id' : ''}
      ${imagesTableExists ? 'GROUP BY b.id' : ''}
      ORDER BY b.created_at DESC
    `);

    // Format the booking data
    const formattedRepairs = result.rows.map(booking => ({
      id: booking.id,
      bookingId: booking.id,
      deviceType: booking.device_type,
      deviceBrand: booking.device_brand,
      deviceModel: booking.device_model,
      issueDescription: booking.issue_description,
      customerName: booking.full_name,
      customerEmail: booking.email,
      customerPhone: booking.phone,
      address: booking.address,
      dateSubmitted: booking.preferred_date,
      preferredTime: booking.preferred_time,
      serviceType: booking.service_type,
      status: booking.status || 'Pending',
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      images: booking.images || []
    }));

    res.json({
      success: true,
      repairs: formattedRepairs,
      totalCount: formattedRepairs.length,
      imagesSupported: imagesTableExists
    });

  } catch (error) {
    console.error('Error fetching all repairs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching repairs',
      error: error.message
    });
  }
});


// Add this to your existing admin.js or create a separate repairs.js route file
// This should be added after your existing admin routes

// GET /api/repairs/customer/:identifier - Get repairs for a specific customer
router.get('/repairs/customer/:identifier', async (req, res) => {
    console.log('=== CUSTOMER REPAIRS REQUEST ===');
    console.log('Identifier:', req.params.identifier);
    
    try {
        const identifier = req.params.identifier;
        
        if (!identifier || identifier.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Customer identifier is required'
            });
        }

        // First, let's check what tables we have available
        const tablesResult = await repairDbPool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);
        
        console.log('Available tables:', tablesResult.rows.map(r => r.table_name));

        // Check if bookings table exists and get its structure
        const bookingsTableExists = await tableExists(repairDbPool, 'bookings');
        
        if (!bookingsTableExists) {
            return res.status(404).json({
                success: false,
                message: 'Bookings table not found',
                debug: {
                    availableTables: tablesResult.rows.map(r => r.table_name),
                    searchedFor: 'bookings'
                }
            });
        }

        // Get the bookings table structure
        const bookingsSchema = await repairDbPool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'bookings' AND table_schema = 'public'
            ORDER BY ordinal_position;
        `);

        console.log('Bookings table columns:', bookingsSchema.rows.map(r => r.column_name));

        // Find potential customer identifier columns
        const customerColumns = bookingsSchema.rows
            .map(r => r.column_name)
            .filter(col => 
                col.includes('email') || 
                col.includes('customer') || 
                col.includes('user') ||
                col.includes('name') ||
                col === 'id'
            );

        console.log('Potential customer columns:', customerColumns);

        if (customerColumns.length === 0) {
            return res.status(500).json({
                success: false,
                message: 'No suitable customer identifier columns found in bookings table',
                debug: {
                    availableColumns: bookingsSchema.rows.map(r => r.column_name),
                    identifier: identifier
                }
            });
        }

        // Try to find bookings using different approaches
        let bookingsResult = null;
        let searchMethod = null;

        // Method 1: Try email-based search
        const emailColumns = customerColumns.filter(col => col.includes('email'));
        for (const emailCol of emailColumns) {
            try {
                console.log(`Trying email search with column: ${emailCol}`);
                const result = await repairDbPool.query(
                    `SELECT * FROM bookings WHERE LOWER(${emailCol}) = LOWER($1) ORDER BY created_at DESC`,
                    [identifier]
                );
                if (result.rows.length > 0) {
                    bookingsResult = result;
                    searchMethod = `email:${emailCol}`;
                    break;
                }
            } catch (error) {
                console.log(`Email search failed for column ${emailCol}:`, error.message);
            }
        }

        // Method 2: Try name-based search if email didn't work
        if (!bookingsResult) {
            const nameColumns = customerColumns.filter(col => 
                col.includes('name') && !col.includes('email')
            );
            for (const nameCol of nameColumns) {
                try {
                    console.log(`Trying name search with column: ${nameCol}`);
                    const result = await repairDbPool.query(
                        `SELECT * FROM bookings WHERE LOWER(${nameCol}) LIKE LOWER($1) ORDER BY created_at DESC`,
                        [`%${identifier}%`]
                    );
                    if (result.rows.length > 0) {
                        bookingsResult = result;
                        searchMethod = `name:${nameCol}`;
                        break;
                    }
                } catch (error) {
                    console.log(`Name search failed for column ${nameCol}:`, error.message);
                }
            }
        }

        // Method 3: Try ID-based search if it's a number
        if (!bookingsResult && !isNaN(identifier)) {
            try {
                console.log('Trying ID search');
                const result = await repairDbPool.query(
                    'SELECT * FROM bookings WHERE id = $1 ORDER BY created_at DESC',
                    [parseInt(identifier)]
                );
                if (result.rows.length > 0) {
                    bookingsResult = result;
                    searchMethod = 'id';
                }
            } catch (error) {
                console.log('ID search failed:', error.message);
            }
        }

        // If still no results, try a broader search
        if (!bookingsResult) {
            try {
                console.log('Trying broader search across all text columns');
                const textColumns = bookingsSchema.rows
                    .filter(r => r.data_type.includes('text') || r.data_type.includes('character'))
                    .map(r => r.column_name);

                const searchConditions = textColumns.map(col => 
                    `LOWER(${col}) LIKE LOWER($1)`
                ).join(' OR ');

                if (searchConditions) {
                    const result = await repairDbPool.query(
                        `SELECT * FROM bookings WHERE ${searchConditions} ORDER BY created_at DESC LIMIT 20`,
                        [`%${identifier}%`]
                    );
                    if (result.rows.length > 0) {
                        bookingsResult = result;
                        searchMethod = 'broad_text_search';
                    }
                }
            } catch (error) {
                console.log('Broad search failed:', error.message);
            }
        }

        if (!bookingsResult || bookingsResult.rows.length === 0) {
            return res.json({
                success: true,
                repairs: [],
                message: 'No repairs found for this customer',
                debug: {
                    identifier: identifier,
                    searchMethods: 'Tried email, name, ID, and broad text search',
                    availableColumns: bookingsSchema.rows.map(r => r.column_name),
                    tableUsed: 'bookings'
                }
            });
        }

        // Process the bookings and add images if available
        const bookings = bookingsResult.rows;
        const imagesTableExists = await tableExists(repairDbPool, 'booking_images');
        
        // Add images to each booking if the images table exists
        if (imagesTableExists) {
            for (let booking of bookings) {
                try {
                    const imagesResult = await repairDbPool.query(
                        'SELECT id, image_path, original_name, file_size, uploaded_at FROM booking_images WHERE booking_id = $1',
                        [booking.id]
                    );
                    booking.images = imagesResult.rows;
                } catch (error) {
                    console.log(`Failed to get images for booking ${booking.id}:`, error.message);
                    booking.images = [];
                }
            }
        } else {
            bookings.forEach(booking => booking.images = []);
        }

        console.log(`Found ${bookings.length} bookings using method: ${searchMethod}`);

        res.json({
            success: true,
            repairs: bookings,
            customerInfo: {
                identifier: identifier,
                searchMethod: searchMethod,
                recordsFound: bookings.length
            },
            debug: {
                tableUsed: 'bookings',
                searchMethod: searchMethod,
                imagesSupported: imagesTableExists,
                availableColumns: bookingsSchema.rows.map(r => r.column_name)
            }
        });

    } catch (error) {
        console.error('Error fetching customer repairs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch customer repairs',
            message: error.message,
            debug: {
                identifier: req.params.identifier,
                errorCode: error.code,
                errorDetail: error.detail
            }
        });
    }
});

// Alternative endpoint specifically for the customer dashboard
// GET /api/customer/repairs/:identifier - Get repairs for customer dashboard
router.get('/customer/repairs/:identifier', async (req, res) => {
    // Redirect to the main repairs endpoint to avoid code duplication
    req.url = `/api/repairs/customer/${req.params.identifier}`;
    return router.handle(req, res);
});

// Middleware to add the repairs route to admin router
// Make sure this is exported with your admin routes

module.exports = router;