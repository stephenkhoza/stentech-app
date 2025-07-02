// routes/admin.js
const express = require('express');
const router = express.Router();
const { repairDbPool, customersDbPool } = require('../db');

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

// GET /api/admin/bookings - Get all bookings with optional images
router.get('/bookings', async (req, res) => {
    try {
        // Check if booking_images table exists
        const imagesTableExists = await tableExists(repairDbPool, 'booking_images');
        
        let query;
        let bookingsResult;
        
        if (imagesTableExists) {
            // Query with LEFT JOIN to include images if table exists
            // Fixed column names to match actual table structure
            query = `
                SELECT 
                    b.*,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'id', bi.id,
                                'image_path', bi.image_path,
                                'image_name', bi.original_name,
                                'image_size', bi.file_size,
                                'file_path', bi.file_path,
                                'uploaded_at', bi.uploaded_at
                            )
                        ) FILTER (WHERE bi.id IS NOT NULL), 
                        '[]'::json
                    ) as images
                FROM bookings b
                LEFT JOIN booking_images bi ON b.id = bi.booking_id
                GROUP BY b.id
                ORDER BY b.created_at DESC
            `;
        } else {
            // Simple query without images if table doesn't exist
            query = `
                SELECT 
                    *,
                    '[]'::json as images
                FROM bookings 
                ORDER BY created_at DESC
            `;
        }
        
        bookingsResult = await repairDbPool.query(query);
        
        console.log(`Fetched ${bookingsResult.rows.length} bookings (images table exists: ${imagesTableExists})`);
        
        res.json({
            success: true,
            bookings: bookingsResult.rows,
            imagesSupported: imagesTableExists
        });
        
    } catch (error) {
        console.error('Failed to fetch bookings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bookings',
            message: error.message
        });
    }
});

// GET /api/admin/bookings/:id - Get specific booking with images
router.get('/bookings/:id', async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        
        if (isNaN(bookingId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid booking ID'
            });
        }
        
        // Get booking details
        const bookingResult = await repairDbPool.query(
            'SELECT * FROM bookings WHERE id = $1',
            [bookingId]
        );
        
        if (bookingResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }
        
        const booking = bookingResult.rows[0];
        
        // Check if booking_images table exists and get images
        const imagesTableExists = await tableExists(repairDbPool, 'booking_images');
        let images = [];
        
        if (imagesTableExists) {
            const imagesResult = await repairDbPool.query(
                'SELECT id, booking_id, image_path, original_name as image_name, file_size as image_size, file_path, uploaded_at FROM booking_images WHERE booking_id = $1 ORDER BY uploaded_at DESC',
                [bookingId]
            );
            images = imagesResult.rows;
        }
        
        res.json({
            success: true,
            booking: {
                ...booking,
                images: images
            },
            imagesSupported: imagesTableExists
        });
        
    } catch (error) {
        console.error('Failed to fetch booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch booking',
            message: error.message
        });
    }
});

// PUT /api/admin/bookings/:id/status - Update booking status
// Enhanced status update endpoint with comprehensive debugging
// Add this to your admin.js file (replace the existing PUT endpoint)

// PUT /api/admin/bookings/:id/status - Update booking status with enhanced debugging
router.put('/bookings/:id/status', async (req, res) => {
    console.log('=== STATUS UPDATE REQUEST ===');
    console.log('Booking ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);

    try {
        const bookingId = parseInt(req.params.id);
        const { status } = req.body;
        
        // Enhanced validation
        if (isNaN(bookingId)) {
            console.log('❌ Invalid booking ID:', req.params.id);
            return res.status(400).json({
                success: false,
                error: 'Invalid booking ID - must be a number',
                debug: { providedId: req.params.id, parsedId: bookingId }
            });
        }
        
        if (!status || typeof status !== 'string' || status.trim() === '') {
            console.log('❌ Invalid status:', status);
            return res.status(400).json({
                success: false,
                error: 'Status is required and must be a non-empty string',
                debug: { providedStatus: status, statusType: typeof status }
            });
        }

        const trimmedStatus = status.trim().toLowerCase();
        
        // Define allowed statuses (adjust these based on your business logic)
        const allowedStatuses = [
            'pending', 'confirmed', 'in-progress', 'in_progress', 
            'completed', 'cancelled', 'on-hold', 'on_hold',
            'awaiting-parts', 'awaiting_parts', 'ready-for-pickup', 
            'ready_for_pickup', 'delivered'
        ];
        
        if (!allowedStatuses.includes(trimmedStatus)) {
            console.log('❌ Status not allowed:', trimmedStatus);
            return res.status(400).json({
                success: false,
                error: 'Invalid status value',
                debug: { 
                    providedStatus: status,
                    trimmedStatus: trimmedStatus,
                    allowedStatuses: allowedStatuses 
                }
            });
        }

        console.log('✅ Validation passed. Updating booking:', bookingId, 'to status:', trimmedStatus);

        // First, check if the booking exists
        const existingBooking = await repairDbPool.query(
            'SELECT id, status, full_name, email FROM bookings WHERE id = $1',
            [bookingId]
        );

        if (existingBooking.rows.length === 0) {
            console.log('❌ Booking not found:', bookingId);
            return res.status(404).json({
                success: false,
                error: 'Booking not found',
                debug: { bookingId: bookingId }
            });
        }

        const currentBooking = existingBooking.rows[0];
        console.log('📋 Current booking:', currentBooking);

        // Update the booking status
        const updateResult = await repairDbPool.query(
            'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [trimmedStatus, bookingId]
        );

        if (updateResult.rows.length === 0) {
            console.log('❌ Update failed - no rows affected');
            return res.status(500).json({
                success: false,
                error: 'Failed to update booking - no rows affected',
                debug: { 
                    bookingId: bookingId, 
                    status: trimmedStatus,
                    rowsAffected: updateResult.rowCount 
                }
            });
        }

        const updatedBooking = updateResult.rows[0];
        console.log('✅ Booking updated successfully:', updatedBooking);

        // Verify the update worked
        const verificationResult = await repairDbPool.query(
            'SELECT id, status, updated_at FROM bookings WHERE id = $1',
            [bookingId]
        );

        console.log('🔍 Verification result:', verificationResult.rows[0]);

        res.json({
            success: true,
            message: 'Booking status updated successfully',
            booking: updatedBooking,
            debug: {
                previousStatus: currentBooking.status,
                newStatus: updatedBooking.status,
                updateTime: updatedBooking.updated_at,
                verification: verificationResult.rows[0]
            }
        });
        
    } catch (error) {
        console.error('❌ DATABASE ERROR during status update:', error);
        console.error('Error stack:', error.stack);
        
        res.status(500).json({
            success: false,
            error: 'Database error while updating booking status',
            message: error.message,
            debug: {
                errorCode: error.code,
                errorDetail: error.detail,
                errorHint: error.hint,
                bookingId: req.params.id,
                requestedStatus: req.body.status
            }
        });
    }
});

// Alternative PATCH endpoint for compatibility
router.patch('/bookings/:id/status', async (req, res) => {
    console.log('🔄 PATCH request redirected to PUT handler');
    // Redirect to PUT handler to avoid code duplication
    req.method = 'PUT';
    return router._router.stack.find(layer => 
        layer.route && layer.route.path === '/bookings/:id/status' && 
        layer.route.methods.put
    ).route.stack[0].handle(req, res);
});

// Add a new endpoint to check database schema
router.get('/bookings/schema/check', async (req, res) => {
    try {
        // Check the bookings table structure
        const schemaResult = await repairDbPool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'bookings' AND table_schema = 'public'
            ORDER BY ordinal_position;
        `);

        // Check if there are any constraints on the status column
        const constraintResult = await repairDbPool.query(`
            SELECT constraint_name, constraint_type
            FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
            WHERE tc.table_name = 'bookings' AND ccu.column_name = 'status';
        `);

        // Get sample data to see current status values
        const sampleData = await repairDbPool.query(`
            SELECT id, status, created_at 
            FROM bookings 
            ORDER BY created_at DESC 
            LIMIT 5;
        `);

        res.json({
            success: true,
            schema: {
                columns: schemaResult.rows,
                constraints: constraintResult.rows,
                sampleData: sampleData.rows
            }
        });

    } catch (error) {
        console.error('Error checking schema:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check database schema',
            message: error.message
        });
    }
});

// POST /api/admin/bookings/:id/images - Add image to booking (only if table exists)
router.post('/bookings/:id/images', async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        
        if (isNaN(bookingId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid booking ID'
            });
        }
        
        // Check if booking_images table exists
        const imagesTableExists = await tableExists(repairDbPool, 'booking_images');
        
        if (!imagesTableExists) {
            return res.status(501).json({
                success: false,
                error: 'Image upload not supported - booking_images table not found'
            });
        }
        
        const { image_path, image_name, image_size, file_path } = req.body;
        
        if (!image_path && !file_path) {
            return res.status(400).json({
                success: false,
                error: 'Image path or file path is required'
            });
        }
        
        // Verify booking exists
        const bookingCheck = await repairDbPool.query(
            'SELECT id FROM bookings WHERE id = $1',
            [bookingId]
        );
        
        if (bookingCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }
        
        // Insert image record with correct column names
        const result = await repairDbPool.query(`
            INSERT INTO booking_images (booking_id, image_path, original_name, file_size, file_path)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, booking_id, image_path, original_name as image_name, file_size as image_size, file_path, uploaded_at
        `, [bookingId, image_path || file_path, image_name, image_size, file_path || image_path]);
        
        res.json({
            success: true,
            image: result.rows[0]
        });
        
    } catch (error) {
        console.error('Failed to add image to booking:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add image to booking',
            message: error.message
        });
    }
});

// DELETE /api/admin/bookings/:bookingId/images/:imageId - Delete image from booking
router.delete('/bookings/:bookingId/images/:imageId', async (req, res) => {
    try {
        const bookingId = parseInt(req.params.bookingId);
        const imageId = parseInt(req.params.imageId);
        
        if (isNaN(bookingId) || isNaN(imageId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid booking ID or image ID'
            });
        }
        
        // Check if booking_images table exists
        const imagesTableExists = await tableExists(repairDbPool, 'booking_images');
        
        if (!imagesTableExists) {
            return res.status(501).json({
                success: false,
                error: 'Image operations not supported - booking_images table not found'
            });
        }
        
        const result = await repairDbPool.query(
            'DELETE FROM booking_images WHERE id = $1 AND booking_id = $2 RETURNING *',
            [imageId, bookingId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Image not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Image deleted successfully',
            deletedImage: result.rows[0]
        });
        
    } catch (error) {
        console.error('Failed to delete image:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete image',
            message: error.message
        });
    }
});

// GET /api/admin/stats - Get database statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = {};
        
        // Get booking counts by status
        const statusStats = await repairDbPool.query(`
            SELECT status, COUNT(*) as count
            FROM bookings
            GROUP BY status
        `);
        
        stats.bookingsByStatus = statusStats.rows.reduce((acc, row) => {
            acc[row.status || 'pending'] = parseInt(row.count);
            return acc;
        }, {});
        
        // Get total bookings
        const totalBookings = await repairDbPool.query('SELECT COUNT(*) as count FROM bookings');
        stats.totalBookings = parseInt(totalBookings.rows[0].count);
        
        // Get bookings this month
        const thisMonth = await repairDbPool.query(`
            SELECT COUNT(*) as count 
            FROM bookings 
            WHERE created_at >= date_trunc('month', CURRENT_DATE)
        `);
        stats.bookingsThisMonth = parseInt(thisMonth.rows[0].count);
        
        // Check if images table exists and get image count
        const imagesTableExists = await tableExists(repairDbPool, 'booking_images');
        stats.imagesSupported = imagesTableExists;
        
        if (imagesTableExists) {
            const imageCount = await repairDbPool.query('SELECT COUNT(*) as count FROM booking_images');
            stats.totalImages = parseInt(imageCount.rows[0].count);
        } else {
            stats.totalImages = 0;
        }
        
        res.json({
            success: true,
            stats: stats
        });
        
    } catch (error) {
        console.error('Failed to fetch stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics',
            message: error.message
        });
    }
});

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Admin API root - under construction'
  });
});

// View all customers
router.get('/customers', async (req, res) => {
  try {
    const result = await customersDbPool.query('SELECT id, first_name, surname, email, username, created_at FROM customers ORDER BY created_at DESC');
    res.json({ success: true, customers: result.rows });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
});

// PATCH /api/admin/bookings/:id/status (Alternative endpoint)
router.patch('/bookings/:id/status', async (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }

  try {
    const result = await repairDbPool.query(
      'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, bookingId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ success: false, message: 'Failed to update booking status' });
  }
});

module.exports = router;