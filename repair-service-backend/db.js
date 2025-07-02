// db.js
require('dotenv').config();
const { Pool } = require('pg');

//Repair service database pool
const repairDbPool = new Pool({
  user: process.env.DB_USER || 'repair_admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'stentech_repair',
  password: process.env.DB_PASSWORD || 'St1flerk@tut',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// const repairDbPool = new Pool({
//   user: process.env.REPAIR_DB_USER,
//   host: process.env.REPAIR_DB_HOST,
//   database: process.env.REPAIR_DB_NAME,
//   password: process.env.REPAIR_DB_PASSWORD,
//   port: parseInt(process.env.REPAIR_DB_PORT),
//   ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
// });


repairDbPool.on('connect', () => {
  console.log('✅ Connected to repair_service database');
});

repairDbPool.on('error', (err) => {
  console.error('🔥 Unexpected repairDbPool error:', err);
  process.exit(1);
});

// Optional: Customer DB
const customersDbPool = new Pool({
  user: process.env.CUSTOMERS_DB_USER || process.env.DB_USER,
  host: process.env.CUSTOMERS_DB_HOST || process.env.DB_HOST || 'localhost',
  database: process.env.CUSTOMERS_DB_NAME || 'stentech_customers',
  password: process.env.CUSTOMERS_DB_PASSWORD || process.env.DB_PASSWORD,
  port: process.env.CUSTOMERS_DB_PORT ? parseInt(process.env.CUSTOMERS_DB_PORT) : 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

customersDbPool.on('connect', () => {
  console.log('✅ Connected to customers database');
});

customersDbPool.on('error', (err) => {
  console.error('🔥 Unexpected customersDbPool error:', err);
});

// Export pools
module.exports = {
  repairDbPool,
  customersDbPool,
  pool: repairDbPool // backward compatibility
};


