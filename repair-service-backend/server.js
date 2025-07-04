// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// server.js (top, right after require('dotenv').config())
console.log('🔍 Environment variables check:');
console.log('REPAIR_DB_URL:', process.env.REPAIR_DB_URL ? '[REPAIR_DB_URL loaded]' : 'NOT SET or undefined');
console.log('CUSTOMERS_DB_URL:', process.env.CUSTOMERS_DB_URL ? '[CUSTOMERS_DB_URL loaded]' : 'NOT SET or undefined');


// Debug: Check if environment variables are loaded
console.log('🔍 Environment variables check:');
console.log('PORT:', process.env.PORT);
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);


// Import database pools
const { repairDbPool, customersDbPool } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;


app.use((req, res, next) => {
  if (req.path.substr(-1) === '/' && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
  } else {
    next();
  }
});

// Middleware
// app.use(cors({
//   origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
//   credentials: true,
// }));



app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://stentech-app.vercel.app', // your frontend domain
  credentials: true
}));




app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.set('trust proxy', true);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Import and use routes
// Import and use routes
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/admin', require('./routes/admin'));

// Fix contact route - make sure it's properly mounted
const contactRouter = require('./routes/contact');
app.use('/api/contact', contactRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Stentech Repair Service API',
    version: '1.0.0',
    endpoints: {
      bookings: '/api/bookings',
      uploads: '/api/uploads',
      customers: '/api/customers',
      admin: '/api/admin',
      health: '/api/health',
    },
  });
});

// Debug endpoint to check available tables in repair database
app.get('/api/debug/repair-tables', async (req, res) => {
  try {
    const result = await repairDbPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    res.json({
      success: true,
      tables: result.rows.map(row => row.table_name)
    });
  } catch (error) {
    console.error('Error fetching repair database tables:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Debug endpoint to check table structure
app.get('/api/debug/table-structure/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const result = await repairDbPool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = $1 
      ORDER BY ordinal_position
    `, [tableName]);
    
    res.json({
      success: true,
      table: tableName,
      columns: result.rows
    });
  } catch (error) {
    console.error('Error fetching table structure:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Fixed endpoint for fetching customer repairs
// Fixed endpoint for fetching customer repairs
app.get('/api/repairs/customer/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    console.log('Fetching repairs for identifier:', identifier);
    
    // First, check what tables exist in the repair database
    const tablesResult = await repairDbPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log('Available tables in repair database:', tables);
    
    // Find the most likely table name for repairs
    const possibleRepairTables = tables.filter(table => 
      table.toLowerCase().includes('repair') || 
      table.toLowerCase().includes('booking') ||
      table.toLowerCase().includes('service') ||
      table.toLowerCase().includes('job')
    );
    
    if (possibleRepairTables.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'No repair-related tables found in database',
        availableTables: tables
      });
    }
    
    console.log('Possible repair tables:', possibleRepairTables);
    
    // Try to find the customer first
    let customer;
    let customerResult;
    
    // Try to find by email first
    if (identifier.includes('@')) {
      customerResult = await customersDbPool.query('SELECT * FROM customers WHERE email = $1', [identifier]);
    } else if (isNaN(identifier)) {
      // Try username if it's not a number
      customerResult = await customersDbPool.query('SELECT * FROM customers WHERE username = $1', [identifier]);
    } else {
      // Try ID if it's a number
      customerResult = await customersDbPool.query('SELECT * FROM customers WHERE id = $1', [identifier]);
    }
    
    if (!customerResult || customerResult.rows.length === 0) {
      console.log('Customer not found for identifier:', identifier);
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }

   
    
    customer = customerResult.rows[0];
    const customerId = customer.id;
    const customerEmail = customer.email;
    
    console.log('Found customer:', { id: customerId, email: customerEmail });
    
    // Try to fetch repairs from the most likely table
    const repairTableName = possibleRepairTables[0]; // Use the first match
    console.log('Using repair table:', repairTableName);
    
    // Get table structure to understand available columns
    const columnsResult = await repairDbPool.query(`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = $1 
      ORDER BY ordinal_position
    `, [repairTableName]);
    
    const columns = columnsResult.rows.map(row => row.column_name);
    console.log('Available columns in', repairTableName, ':', columns);
    
    // Build dynamic query based on available columns
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;
    
    // Check for customer_id column
    if (columns.includes('customer_id')) {
      whereConditions.push(`customer_id = $${++paramCount}`);
      queryParams.push(customerId);
    }
    
    // Check for email-related columns
    const emailColumns = columns.filter(col => 
      col.toLowerCase().includes('email') || col === 'email'
    );
    
    if (emailColumns.length > 0) {
      emailColumns.forEach(col => {
        whereConditions.push(`${col} = $${++paramCount}`);
        queryParams.push(customerEmail);
      });
    }
    
    if (whereConditions.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'No suitable columns found to link repairs to customer',
        tableColumns: columns
      });
    }
    
    const query = `
      SELECT * FROM ${repairTableName} 
      WHERE (${whereConditions.join(' OR ')}) 
      ORDER BY ${columns.includes('created_at') ? 'created_at' : columns.includes('date_submitted') ? 'date_submitted' : columns[0]} DESC
    `;
    
    console.log('Executing query:', query);
    console.log('With params:', queryParams);
    
    const repairsResult = await repairDbPool.query(query, queryParams);
    const repairs = repairsResult.rows;
    
    console.log('Found repairs:', repairs.length);
    
    // Transform repair data to match frontend expectations
    const formattedRepairs = repairs.map(repair => ({
      id: repair.id || repair.repair_id || `REP${repair.id}`,
      deviceType: repair.device_type || repair.deviceType,
      deviceBrand: repair.device_brand || repair.deviceBrand,
      deviceModel: repair.device_model || repair.deviceModel,
      issueDescription: repair.issue_description || repair.issueDescription || repair.issue,
      status: repair.status || 'Pending',
      dateSubmitted: repair.created_at || repair.date_submitted || repair.dateSubmitted,
      estimatedCompletion: repair.estimated_completion || repair.estimatedCompletion,
      completedDate: repair.completed_date || repair.completedDate,
      technician: repair.technician || repair.assigned_technician,
      cost: repair.cost || repair.total_cost,
      estimatedCost: repair.estimated_cost || repair.estimatedCost,
      serviceType: repair.service_type || repair.serviceType,
      // Include customer info for verification
      customerName: repair.customer_name || repair.full_name || repair.fullName,
      customerEmail: repair.customer_email || repair.email,
      customerPhone: repair.customer_phone || repair.phone
    }));
    
    res.json({
      success: true,
      repairs: formattedRepairs,
      customerInfo: {
        id: customerId,
        email: customerEmail,
        name: customer.name || customer.username
      },
      debug: {
        tableUsed: repairTableName,
        availableTables: tables,
        columnsUsed: columns
      }
    });
    
  } catch (error) {
    console.error('Error fetching customer repairs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Enhanced health check that tests both databases
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {}
  };

  try {
    // Test repair database
    await repairDbPool.query('SELECT 1');
    health.services.repairDb = 'OK';
  } catch (error) {
    console.error('Repair DB health check failed:', error);
    health.services.repairDb = 'ERROR';
    health.status = 'DEGRADED';
  }

  try {
    // Test customers database
    await customersDbPool.query('SELECT 1');
    health.services.customersDb = 'OK';
  } catch (error) {
    console.error('Customers DB health check failed:', error);
    health.services.customersDb = 'ERROR';
    health.status = 'DEGRADED';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Simple health check endpoint (for external monitoring)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Test DB queries (for debugging)
app.get('/api/test-bookings', async (req, res) => {
  try {
    const result = await repairDbPool.query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5');
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('Repair database query failed:', err);
    res.status(500).json({ 
      success: false,
      error: 'Repair database query failed',
      message: err.message 
    });
  }
});

app.get('/api/test-customers', async (req, res) => {
  try {
    const result = await customersDbPool.query('SELECT id, username, email, created_at FROM customers ORDER BY created_at DESC LIMIT 5');
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('Customers database query failed:', err);
    res.status(500).json({ 
      success: false,
      error: 'Customers database query failed',
      message: err.message 
    });
  }
});

// Database connection test endpoint
app.get('/api/db-status', async (req, res) => {
  const status = {
    repairDb: { status: 'unknown', error: null },
    customersDb: { status: 'unknown', error: null }
  };

  // Test repair database
  try {
    const result = await repairDbPool.query('SELECT NOW() as current_time, version() as version');
    status.repairDb = {
      status: 'connected',
      currentTime: result.rows[0].current_time,
      version: result.rows[0].version.split(' ')[0] // Just PostgreSQL version number
    };
  } catch (error) {
    status.repairDb = {
      status: 'error',
      error: error.message
    };
  }

  // Test customers database
  try {
    const result = await customersDbPool.query('SELECT NOW() as current_time, COUNT(*) as customer_count FROM customers');
    status.customersDb = {
      status: 'connected',
      currentTime: result.rows[0].current_time,
      customerCount: parseInt(result.rows[0].customer_count)
    };
  } catch (error) {
    status.customersDb = {
      status: 'error',
      error: error.message
    };
  }

  const allConnected = status.repairDb.status === 'connected' && status.customersDb.status === 'connected';
  res.status(allConnected ? 200 : 503).json(status);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/health',
      'GET /api/db-status',
      'GET /api/repairs/customer/:identifier',
      'POST /api/customers/register',
      'POST /api/customers/login',
      'GET /api/customers/profile'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method
  });

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ 
      success: false,
      error: 'File upload error: ' + err.message 
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      success: false,
      error: 'Invalid token' 
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      success: false,
      error: 'Token expired' 
    });
  }

  if (err.code && err.code.startsWith('23')) {
    return res.status(400).json({ 
      success: false,
      error: 'Database constraint violation',
      details: process.env.NODE_ENV === 'development' ? err.detail : undefined
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  
  try {
    await repairDbPool.end();
    console.log('Repair database pool closed');
  } catch (error) {
    console.error('Error closing repair database pool:', error);
  }

  try {
    await customersDbPool.end();
    console.log('Customers database pool closed');
  } catch (error) {
    console.error('Error closing customers database pool:', error);
  }

  process.exit(0);
};


// In your backend server file (likely app.js or server.js)
// Replace the basic PUT endpoint in your server.js with this:

app.put('/api/admin/bookings/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;
    const updateData = req.body;
    
    console.log(`Updating booking ${bookingId} with data:`, updateData);
    
    // First, check if the booking exists
    const existingBooking = await repairDbPool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [bookingId]
    );
    
    if (existingBooking.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Build dynamic UPDATE query based on provided fields
    const allowedFields = [
      'status', 'device_type', 'device_brand', 'device_model', 
      'issue_description', 'estimated_completion', 'completed_date',
      'technician', 'cost', 'estimated_cost', 'service_type',
      'customer_name', 'customer_email', 'customer_phone'
    ];
    
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;
    
    // Build SET clause dynamically
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updateFields.push(`${key} = $${++paramCount}`);
        updateValues.push(updateData[key]);
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    
    // Add updated_at timestamp
    updateFields.push(`updated_at = $${++paramCount}`);
    updateValues.push(new Date());
    
    // Add the booking ID for WHERE clause
    updateValues.push(bookingId);
    
    const updateQuery = `
      UPDATE bookings 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    console.log('Executing update query:', updateQuery);
    console.log('With values:', updateValues);
    
    const result = await repairDbPool.query(updateQuery, updateValues);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found or update failed'
      });
    }
    
    const updatedBooking = result.rows[0];
    
    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking: updatedBooking
    });
    
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Also add these additional endpoints that your frontend might need:

// GET single booking (useful for fetching updated data)
app.get('/api/admin/bookings/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    const result = await repairDbPool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [bookingId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      booking: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// DELETE booking (if needed)
app.delete('/api/admin/bookings/:id', async (req, res) => {
  try {
    const bookingId = req.params.id;
    
    const result = await repairDbPool.query(
      'DELETE FROM bookings WHERE id = $1 RETURNING *',
      [bookingId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Booking deleted successfully',
      deletedBooking: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});


// Debug: List all registered routes
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(`Route: ${Object.keys(r.route.methods)} ${r.route.path}`)
  }
});






process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API endpoints: http://localhost:${PORT}/api`);
  console.log(`🔐 Customer auth: http://localhost:${PORT}/api/customers`);
  console.log(`💾 Database status: http://localhost:${PORT}/api/db-status`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;