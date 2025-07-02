// routes/customers.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const { customersDbPool } = require('../db');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { 
    success: false,
    message: 'Too many login attempts, please try again later.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const registerSchema = Joi.object({
  firstName: Joi.string().max(16).required(),
  surname: Joi.string().max(20).required(),
  emailOrPhone: Joi.string().max(34).required(),
  username: Joi.string().max(18).alphanum().required(),
  password: Joi.string().min(6).max(16).required(),
  receiveEmails: Joi.boolean().default(false)
});

const loginSchema = Joi.object({
  email: Joi.string().max(34).required(), // Can be email or username
  password: Joi.string().max(16).required()
});

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username,
      email: user.email 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Helper function to validate password strength
const isValidPassword = (password) => {
  // At least 6 characters
  if (password.length < 6) return false;
  return true;
};

// Helper function to check if input is email or phone
const isEmail = (input) => {
  return input.includes('@') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
};

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', { 
      ...req.body, 
      password: '[HIDDEN]' 
    });

    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { firstName, surname, emailOrPhone, username, password, receiveEmails } = value;

    // Additional password validation
    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Determine if emailOrPhone is email or phone
    let email = null;
    let phone = null;
    
    if (isEmail(emailOrPhone)) {
      email = emailOrPhone.toLowerCase();
    } else {
      phone = emailOrPhone;
    }

    // Check if user already exists
    const existingUserQuery = `
      SELECT id FROM customers 
      WHERE email = $1 OR username = $2 OR phone = $3
    `;
    const existingUser = await customersDbPool.query(existingUserQuery, [email, username, phone]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email, phone, or username already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const insertQuery = `
      INSERT INTO customers (first_name, surname, email, phone, username, password_hash, receive_emails)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, first_name, surname, email, phone, username, receive_emails, created_at
    `;
    
    const result = await customersDbPool.query(insertQuery, [
      firstName,
      surname,
      email,
      phone,
      username,
      passwordHash,
      receiveEmails
    ]);

    const newUser = result.rows[0];

    console.log('Registration successful:', {
      id: newUser.id,
      username: newUser.username
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        firstName: newUser.first_name,
        surname: newUser.surname,
        email: newUser.email,
        phone: newUser.phone,
        username: newUser.username,
        receiveEmails: newUser.receive_emails,
        createdAt: newUser.created_at
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === '23505') { // PostgreSQL unique violation
      return res.status(400).json({
        success: false,
        message: 'User with this email, phone, or username already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// Login endpoint
router.post('/login', authLimiter, async (req, res) => {
  try {
    console.log('Login attempt:', { 
      email: req.body.email,
      password: '[HIDDEN]' 
    });

    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { email, password } = value;

    // Find user by email or username
    const userQuery = `
      SELECT id, first_name, surname, email, phone, username, password_hash, 
             account_status, failed_login_attempts, locked_until
      FROM customers 
      WHERE email = $1 OR username = $1
    `;
    
    const result = await customersDbPool.query(userQuery, [email.toLowerCase()]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = result.rows[0];

    // Check if account is locked
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      return res.status(401).json({
        success: false,
        message: 'Account temporarily locked due to too many failed attempts'
      });
    }

    // Check if account is suspended
    if (user.account_status === 'suspended') {
      return res.status(401).json({
        success: false,
        message: 'Account has been suspended. Please contact support.'
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      // Increment failed login attempts
      const failedAttempts = (user.failed_login_attempts || 0) + 1;
      let lockedUntil = null;

      // Lock account after 5 failed attempts for 30 minutes
      if (failedAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }

      await customersDbPool.query(
        'UPDATE customers SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3',
        [failedAttempts, lockedUntil, user.id]
      );

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset failed login attempts on successful login
    await customersDbPool.query(
      'UPDATE customers SET failed_login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = generateToken(user);

    console.log('Login successful:', {
      id: user.id,
      username: user.username
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        surname: user.surname,
        name: `${user.first_name} ${user.surname}`,
        email: user.email,
        phone: user.phone,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Get user profile (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userQuery = `
      SELECT id, first_name, surname, email, phone, username, 
             receive_emails, created_at, last_login
      FROM customers 
      WHERE id = $1
    `;
    
    const result = await customersDbPool.query(userQuery, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.first_name,
        surname: user.surname,
        name: `${user.first_name} ${user.surname}`,
        email: user.email,
        phone: user.phone,
        username: user.username,
        receiveEmails: user.receive_emails,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

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

// Health check for customer service
router.get('/health', async (req, res) => {
  try {
    await customersDbPool.query('SELECT 1');
    res.json({
      status: 'OK',
      service: 'customers',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      service: 'customers',
      message: 'Database connection failed'
    });
  }
});



// GET /api/customers - List all customers
router.get('/', async (req, res) => {
  try {
    const result = await customersDbPool.query(`
      SELECT id, first_name, surname, email, phone, username, created_at
      FROM customers
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      customers: result.rows
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers'
    });
  }
});



module.exports = router;