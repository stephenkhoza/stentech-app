// db.js
require('dotenv').config();
const { Pool } = require('pg');

// === Repair Service Database Connection ===
const repairDbPool = new Pool({
  connectionString: process.env.REPAIR_DB_URL,
  ssl: {
    rejectUnauthorized: false, // Needed for Railway
  },
});

repairDbPool.on('connect', () => {
  console.log('✅ Connected to REPAIR_DB_URL');
});

repairDbPool.on('error', (err) => {
  console.error('🔥 Repair DB connection error:', err);
  process.exit(1);
});

// === Customers Database (Optional) ===
let customersDbPool;

if (process.env.CUSTOMERS_DB_URL) {
  customersDbPool = new Pool({
    connectionString: process.env.CUSTOMERS_DB_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  customersDbPool.on('connect', () => {
    console.log('✅ Connected to CUSTOMERS_DB_URL');
  });

  customersDbPool.on('error', (err) => {
    console.error('🔥 Customers DB connection error:', err);
  });
} else {
  console.warn('⚠️ CUSTOMERS_DB_URL not set. Skipping customers DB connection.');
}

// === Export Pools ===
module.exports = {
  repairDbPool,
  customersDbPool,
  pool: repairDbPool // backward compatibility
};
