import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi';

// API configuration - Updated for correct backend ports
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CustomerLogin = ({ setIsCustomerAuthenticated = () => {} }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  // Enhanced API call with better error handling
  const authenticateUser = async (credentials) => {
    try {
      console.log('Attempting to connect to:', `${API_BASE_URL}/customers/login`);
      
      const response = await fetch(`${API_BASE_URL}/customers/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API call failed:', error);
      
      // Handle network errors more specifically
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Cannot connect to server at ${API_BASE_URL}. Please check if the server is running.`);
      }
      
      // Handle CORS errors
      if (error.message.includes('CORS')) {
        throw new Error('Server configuration error. Please contact support.');
      }
      
      throw error;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading) return;
    
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!formData.email.includes('@') && !formData.email.match(/^[a-zA-Z0-9_]+$/)) {
      setError('Please enter a valid email address or username');
      setLoading(false);
      return;
    }

    try {
      // Prepare credentials for API
      const credentials = {
        email: formData.email.trim(),
        password: formData.password,
      };

      console.log('Sending login request...');
      
      // Call API to authenticate user
      const result = await authenticateUser(credentials);

      console.log('Login response:', result);

      if (result.success) {
        // Store customer info and token for the dashboard
        const customerData = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          username: result.user.username,
          firstName: result.user.firstName,
          surname: result.user.surname,
          loginTime: new Date().toISOString(),
          token: result.token // Store authentication token
        };

        // Store in sessionStorage instead of localStorage for better security
        sessionStorage.setItem('customerData', JSON.stringify(customerData));
        sessionStorage.setItem('authToken', result.token);

        console.log('Login successful:', customerData);
        
        // Update authentication state first
        if (typeof setIsCustomerAuthenticated === 'function') {
          setIsCustomerAuthenticated(true);
        }

        // Use setTimeout to ensure state updates complete before navigation
        setTimeout(() => {
          navigate('/customer-dashboard', { replace: true });
        }, 100);

      } else {
        setError(result.message || 'Login failed');
      }

    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error cases with more helpful messages
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('cannot connect')) {
        setError('Cannot connect to server. Please check your internet connection and try again.');
      } else if (errorMessage.includes('invalid credentials')) {
        setError('Invalid email/username or password');
      } else if (errorMessage.includes('user not found')) {
        setError('No account found with this email/username');
      } else if (errorMessage.includes('account not verified')) {
        setError('Please verify your account before logging in');
      } else if (errorMessage.includes('account suspended')) {
        setError('Your account has been suspended. Please contact support.');
      } else if (errorMessage.includes('too many')) {
        setError('Too many login attempts. Please try again later.');
      } else if (errorMessage.includes('server error')) {
        setError('Server is experiencing issues. Please try again later.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Test connection function (for debugging)
  const testConnection = async () => {
    try {
      console.log('Testing connection to:', API_BASE_URL);
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
      });
      console.log('Health check response:', response.status);
    } catch (error) {
      console.error('Connection test failed:', error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <img 
              src="/images/footer_logo.png" 
              alt="Stentech Logo" 
              style={styles.logo}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            {/* <div style={styles.iconContainer}>
              <FiUserPlus style={styles.headerIcon} />
            </div> */}
          </div>
          <h2 style={styles.title}>Login</h2>
          <p style={styles.subtitle}>Access your repair tracking dashboard</p>
        </div>
        
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address or Username</label>
            <div style={styles.inputContainer}>
              <FiMail style={styles.inputIcon} />
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email or username"
                style={styles.input}
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputContainer}>
              <FiLock style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                style={styles.input}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={styles.eyeButton}
                disabled={loading}
              >
                {showPassword ? <FiEyeOff style={styles.eyeIcon} /> : <FiEye style={styles.eyeIcon} />}
              </button>
            </div>
          </div>
          
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            style={{
              ...styles.submitButton,
              ...(loading ? styles.submitButtonDisabled : {})
            }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Debug button - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <button 
              type="button" 
              onClick={testConnection}
              style={styles.debugButton}
            >
              Test Connection
            </button>
          )}
        </form>
        
        <div style={styles.footer}>
          <div style={styles.links}>
            <Link to="/forgot-password" style={styles.link}>
              Forgot your password?
            </Link>
          </div>
          <div style={styles.divider}>
            <span style={styles.dividerText}>or</span>
          </div>
          <div style={styles.signupPrompt}>
            <span style={styles.signupText}>Don't have an account? </span>
            <Link to="/customer-signup" style={styles.signupLink}>
              Sign up here
            </Link>
          </div>
        </div>

        {/* Debug info - only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <div style={styles.debugInfo}>
            <small>API URL: {API_BASE_URL}</small>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles object (same as before, with additions)
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f7fa',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid #e1e5e9'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  logo: {
    maxWidth: '100px',
    height: 'auto',
    marginRight: '1rem',
  },
  iconContainer: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px'
  },
  headerIcon: {
    fontSize: '24px',
    color: 'white'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#0d9488',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    fontSize: '16px',
    color: '#9ca3af',
    zIndex: 1
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box'
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  eyeIcon: {
    fontSize: '16px',
    color: '#9ca3af'
  },
  error: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'center'
  },
  submitButton: {
    backgroundColor: '#0d9488',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginTop: '10px'
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  },
  debugButton: {
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px',
    fontSize: '12px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  footer: {
    marginTop: '30px'
  },
  links: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  link: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500'
  },
  divider: {
    textAlign: 'center',
    margin: '20px 0',
    position: 'relative'
  },
  dividerText: {
    backgroundColor: 'white',
    color: '#6b7280',
    fontSize: '14px',
    padding: '0 16px',
    position: 'relative',
    zIndex: 1
  },
  signupPrompt: {
    textAlign: 'center',
    marginTop: '20px'
  },
  signupText: {
    color: '#6b7280',
    fontSize: '14px'
  },
  signupLink: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500'
  },
  debugInfo: {
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    textAlign: 'center',
    color: '#6b7280'
  }
};

export default CustomerLogin;