// customer-auth-api.js
// Backend API for Customer Authentication System

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Rate limiting
const createAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  message: 'Too many account creation attempts, please try again later.'
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.'
});

// Database pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'stentech_customers',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// JWT config
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Helpers
const hashPassword = (password) => bcrypt.hash(password, 12);
const comparePassword = (password, hash) => bcrypt.compare(password, hash);
const generateToken = (customerId, email) => 
  jwt.sign({ customerId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

const logLoginAttempt = async (emailOrUsername, ipAddress, success, errorMessage = null) => {
  try {
    await pool.execute(
      `INSERT INTO login_attempts (email_or_username, ip_address, success, error_message)
       VALUES (?, ?, ?, ?)`,
      [emailOrUsername, ipAddress, success, errorMessage]
    );
  } catch (error) {
    console.error('Error logging login attempt:', error);
  }
};

const checkLoginAttempts = async (emailOrUsername, ipAddress) => {
  try {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS attempts FROM login_attempts
       WHERE (email_or_username = ? OR ip_address = ?)
       AND success = FALSE
       AND attempt_time > NOW() - INTERVAL 15 MINUTE`,
      [emailOrUsername, ipAddress]
    );
    return rows[0].attempts >= 5;
  } catch (error) {
    console.error('Error checking login attempts:', error);
    return false;
  }
};

// Routes

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Customer API is running' });
});

app.post('/api/customers/register', createAccountLimiter, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { firstName, surname, emailOrPhone, username, password, receiveEmails = false } = req.body;

    if (!firstName || !surname || !emailOrPhone || !username || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (firstName.length > 16 || surname.length > 20 || emailOrPhone.length > 34 || username.length > 18) {
      return res.status(400).json({ success: false, message: 'Field length exceeded maximum allowed' });
    }

    const [existingUsers] = await connection.execute(
      `SELECT id FROM customers WHERE email = ? OR username = ?`,
      [emailOrPhone, username]
    );
    if (existingUsers.length > 0) {
      return res.status(409).json({ success: false, message: 'User with this email or username already exists' });
    }

    const passwordHash = await hashPassword(password);

    const [result] = await connection.execute(
      `INSERT INTO customers (first_name, surname, email, username, password_hash, receive_emails)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [firstName, surname, emailOrPhone, username, passwordHash, receiveEmails]
    );

    const customerId = result.insertId;
    const token = generateToken(customerId, emailOrPhone);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    const tokenHash = await bcrypt.hash(token, 10);

    await connection.execute(
      `INSERT INTO auth_tokens (customer_id, token_hash, expires_at) VALUES (?, ?, ?)`,
      [customerId, tokenHash, expiresAt]
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: { id: customerId, firstName, surname, email: emailOrPhone, username, name: `${firstName} ${surname}` },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration' });
  } finally {
    connection.release();
  }
});

app.post('/api/customers/login', loginLimiter, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    if (!email || !password) {
      await logLoginAttempt(email, ipAddress, false, 'Missing credentials');
      return res.status(400).json({ success: false, message: 'Email/username and password are required' });
    }

    if (await checkLoginAttempts(email, ipAddress)) {
      await logLoginAttempt(email, ipAddress, false, 'Too many attempts');
      return res.status(429).json({ success: false, message: 'Too many failed login attempts. Please try again later.' });
    }

    const [users] = await connection.execute(
      `SELECT * FROM customers WHERE (email = ? OR username = ?) AND account_status = ?`,
      [email, email, 'active']
    );

    if (users.length === 0) {
      await logLoginAttempt(email, ipAddress, false, 'User not found');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];
    if (user.account_status !== 'active') {
      await logLoginAttempt(email, ipAddress, false, `Account ${user.account_status}`);
      if (user.account_status === 'suspended') {
        return res.status(401).json({ success: false, message: 'Account suspended' });
      } else if (user.account_status === 'pending_verification') {
        return res.status(401).json({ success: false, message: 'Account not verified' });
      }
    }

    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      await logLoginAttempt(email, ipAddress, false, 'Invalid password');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.email);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tokenHash = await bcrypt.hash(token, 10);

    await connection.execute(
      `INSERT INTO auth_tokens (customer_id, token_hash, expires_at) VALUES (?, ?, ?)`,
      [user.id, tokenHash, expiresAt]
    );

    await connection.execute(
      `UPDATE customers SET last_login = CURRENT_TIMESTAMP WHERE id = ?`,
      [user.id]
    );

    await logLoginAttempt(email, ipAddress, true);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.first_name,
        surname: user.surname,
        email: user.email,
        username: user.username,
        name: `${user.first_name} ${user.surname}`
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login' });
  } finally {
    connection.release();
  }
});

// Token verification middleware
const verifyTokenMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // Check token exists and not revoked
    const [tokenRows] = await pool.execute(
      `SELECT at.* FROM auth_tokens at 
       WHERE at.customer_id = ? AND at.expires_at > NOW() AND at.is_revoked = FALSE`,
      [decoded.customerId]
    );

    if (tokenRows.length === 0) {
      return res.status(401).json({ success: false, message: 'Token expired or revoked' });
    }

    // Attach user info to req
    req.user = { id: decoded.customerId };
    next();

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ success: false, message: 'Token verification failed' });
  }
};

app.get('/api/customers/profile', verifyTokenMiddleware, async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, first_name, surname, email, username, receive_emails, email_verified, account_status, created_at, last_login
       FROM customers WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.first_name,
        surname: user.surname,
        email: user.email,
        username: user.username,
        receiveEmails: user.receive_emails,
        emailVerified: user.email_verified,
        accountStatus: user.account_status,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
});

app.post('/api/customers/logout', verifyTokenMiddleware, async (req, res) => {
  try {
    await pool.execute(
      `UPDATE auth_tokens SET is_revoked = TRUE WHERE customer_id = ? AND expires_at > NOW()`,
      [req.user.id]
    );
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Error during logout' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Customer API server running on port ${PORT}`);
});

module.exports = app;
