import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';

// API configuration

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CustomerSignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    emailOrPhone: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreements, setAgreements] = useState({
    receiveEmails: false,
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setAgreements(prev => ({
      ...prev,
      [name]: checked
    }));
    // Clear specific error when user checks/unchecks
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.surname.trim()) newErrors.surname = 'Surname is required';
    if (!formData.emailOrPhone.trim()) newErrors.emailOrPhone = 'Email or phone is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';

    // Length validation
    if (formData.firstName.length > 16) newErrors.firstName = 'First name must be 16 characters or less';
    if (formData.surname.length > 20) newErrors.surname = 'Surname must be 20 characters or less';
    if (formData.emailOrPhone.length > 34) newErrors.emailOrPhone = 'Email/phone must be 34 characters or less';
    if (formData.username.length > 18) newErrors.username = 'Username must be 18 characters or less';
    if (formData.password.length > 16) newErrors.password = 'Password must be 16 characters or less';

    // Email validation (basic check)
    if (formData.emailOrPhone.includes('@') && !formData.emailOrPhone.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.emailOrPhone = 'Please enter a valid email address';
    }

    // Password matching
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Password strength (basic)
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Agreement validation
    if (!agreements.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    return newErrors;
  };

  // API call to register user
  const registerUser = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your connection.');
      }
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      // Prepare user data for API
      const userData = {
        firstName: formData.firstName.trim(),
        surname: formData.surname.trim(),
        emailOrPhone: formData.emailOrPhone.trim(),
        username: formData.username.trim(),
        password: formData.password,
        receiveEmails: agreements.receiveEmails
      };

      // Call API to register user
      const result = await registerUser(userData);

      if (result.success) {
        console.log('Registration successful:', result);
        setSuccess(true);
      } else {
        setErrors({ general: result.message || 'Registration failed' });
      }

    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error cases
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('already exists')) {
        setErrors({ 
          emailOrPhone: 'User with this email already exists',
          username: 'Username already taken'
        });
      } else if (errorMessage.includes('connect')) {
        setErrors({ general: 'Unable to connect to server. Please try again.' });
      } else {
        setErrors({ general: error.message || 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
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
          <h2 style={styles.title}>Create an Account</h2>
          <p style={styles.subtitle}>It's free and always will be.</p>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.nameRow}>
            <div style={styles.nameField}>
              <label style={styles.label}>First Name</label>
              <div style={styles.inputContainer}>
                <FiUser style={styles.inputIcon} />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="First name"
                  maxLength="16"
                  disabled={loading}
                  style={{
                    ...styles.input,
                    borderColor: errors.firstName ? '#ef4444' : '#d1d5db'
                  }}
                />
              </div>
              {errors.firstName && <span style={styles.errorText}>{errors.firstName}</span>}
            </div>
            
            <div style={styles.nameField}>
              <label style={styles.label}>Surname</label>
              <div style={styles.inputContainer}>
                <FiUser style={styles.inputIcon} />
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleInputChange}
                  placeholder="Surname"
                  maxLength="20"
                  disabled={loading}
                  style={{
                    ...styles.input,
                    borderColor: errors.surname ? '#ef4444' : '#d1d5db'
                  }}
                />
              </div>
              {errors.surname && <span style={styles.errorText}>{errors.surname}</span>}
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email or Phone</label>
            <div style={styles.inputContainer}>
              <FiMail style={styles.inputIcon} />
              <input
                type="text"
                name="emailOrPhone"
                value={formData.emailOrPhone}
                onChange={handleInputChange}
                placeholder="Email or Phone"
                maxLength="34"
                disabled={loading}
                style={{
                  ...styles.input,
                  borderColor: errors.emailOrPhone ? '#ef4444' : '#d1d5db'
                }}
              />
            </div>
            {errors.emailOrPhone && <span style={styles.errorText}>{errors.emailOrPhone}</span>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <div style={styles.inputContainer}>
              <FiUser style={styles.inputIcon} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                maxLength="18"
                disabled={loading}
                style={{
                  ...styles.input,
                  borderColor: errors.username ? '#ef4444' : '#d1d5db'
                }}
              />
            </div>
            {errors.username && <span style={styles.errorText}>{errors.username}</span>}
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
                placeholder="New Password"
                maxLength="16"
                disabled={loading}
                style={{
                  ...styles.input,
                  borderColor: errors.password ? '#ef4444' : '#d1d5db'
                }}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('password')}
                style={styles.eyeButton}
                disabled={loading}
              >
                {showPassword ? <FiEyeOff style={styles.eyeIcon} /> : <FiEye style={styles.eyeIcon} />}
              </button>
            </div>
            {errors.password && <span style={styles.errorText}>{errors.password}</span>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <div style={styles.inputContainer}>
              <FiLock style={styles.inputIcon} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Re-enter Password"
                maxLength="16"
                disabled={loading}
                style={{
                  ...styles.input,
                  borderColor: errors.confirmPassword ? '#ef4444' : '#d1d5db'
                }}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                style={styles.eyeButton}
                disabled={loading}
              >
                {showConfirmPassword ? <FiEyeOff style={styles.eyeIcon} /> : <FiEye style={styles.eyeIcon} />}
              </button>
            </div>
            {errors.confirmPassword && <span style={styles.errorText}>{errors.confirmPassword}</span>}
          </div>

          <div style={styles.checkboxGroup}>
            <div style={styles.checkboxItem}>
              <input
                type="checkbox"
                name="receiveEmails"
                id="receiveEmails"
                checked={agreements.receiveEmails}
                onChange={handleCheckboxChange}
                style={styles.checkbox}
                disabled={loading}
              />
              <label htmlFor="receiveEmails" style={styles.checkboxLabel}>
                Yes! I want to get the most out of Stentech by receiving emails with exclusive deals.
              </label>
            </div>

            <div style={styles.checkboxItem}>
              <input
                type="checkbox"
                name="agreeToTerms"
                id="agreeToTerms"
                checked={agreements.agreeToTerms}
                onChange={handleCheckboxChange}
                style={styles.checkbox}
                disabled={loading}
                required
              />
              <label htmlFor="agreeToTerms" style={styles.checkboxLabel}>
                By signing up, I agree to the{' '}
                <Link to="/terms" style={styles.link}>terms and conditions</Link>{' '}
                and{' '}
                <Link to="/privacy" style={styles.link}>privacy policy</Link>.
              </label>
            </div>
            {errors.agreeToTerms && <span style={styles.errorText}>{errors.agreeToTerms}</span>}
          </div>

          {errors.general && (
            <div style={styles.generalError}>
              {errors.general}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              backgroundColor: loading ? '#9ca3af' : '#0d9488',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseOver={(e) => {
              if (!loading) e.target.style.backgroundColor = '#0f766e';
            }}
            onMouseOut={(e) => {
              if (!loading) e.target.style.backgroundColor = '#0d9488';
            }}
          >
            {loading ? (
              <div style={styles.loadingContent}>
                <div style={styles.spinner}></div>
                Creating Account...
              </div>
            ) : (
              <>
                Register Account
                <FiCheck style={styles.buttonIcon} />
              </>
            )}
          </button>
        </form>
        
        <div style={styles.footer}>
          <p style={styles.loginPrompt}>
            Already have an account?{' '}
            <Link to="/customer-login" style={styles.loginLink}>
              Log in
            </Link>
          </p>
        </div>
        
        {success && (
          <div style={styles.successMessage}>
            <FiCheck style={styles.successIcon} />
            <div>
              <h3 style={styles.successTitle}>Account Created Successfully!</h3>
              <p style={styles.successText}>
                Welcome aboard! Your account has been created and you can now sign in with your credentials.
              </p>
              <Link 
                to="/customer-login"
                style={styles.successButton}
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    margin: '140px auto',
   
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdfa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '1rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e6fffa',
    padding: '2rem',
    width: '100%',
    maxWidth: '500px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
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
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '4rem',
    height: '4rem',
    backgroundColor: '#ccfbf1',
    borderRadius: '50%',
  },
  headerIcon: {
    width: '2rem',
    height: '2rem',
    color: '#0d9488',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#0d9488',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#111827',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    margin: 0,
  },
  form: {
    marginBottom: '1.5rem',
  },
  nameRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  nameField: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '0.75rem',
    width: '1.25rem',
    height: '1.25rem',
    color: '#9ca3af',
    zIndex: 1,
  },
  input: {
    width: '100%',
    padding: '0.75rem 0.75rem 0.75rem 2.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.15s ease-in-out',
    boxSizing: 'border-box',
  },
  eyeButton: {
    position: 'absolute',
    right: '0.75rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeIcon: {
    width: '1.25rem',
    height: '1.25rem',
    color: '#9ca3af',
  },
  checkboxGroup: {
    marginBottom: '1.5rem',
  },
  checkboxItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  checkbox: {
    width: '1rem',
    height: '1rem',
    marginTop: '0.125rem',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    lineHeight: '1.4',
    cursor: 'pointer',
  },
  link: {
    color: '#0d9488',
    textDecoration: 'none',
    fontWeight: '500',
  },
  button: {
    width: '100%',
    backgroundColor: '#0d9488',
    color: '#ffffff',
    padding: '0.875rem',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease-in-out',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  loadingContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  spinner: {
    width: '1rem',
    height: '1rem',
    border: '2px solid transparent',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  buttonIcon: {
    width: '1.25rem',
    height: '1.25rem',
  },
  errorText: {
    color: '#ef4444',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
  },
  footer: {
    textAlign: 'center',
  },
  loginPrompt: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
  },
  loginLink: {
    color: '#0d9488',
    textDecoration: 'none',
    fontWeight: '500',
  },
  successMessage: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid #d1fae5',
    padding: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    maxWidth: '400px',
    zIndex: 1000,
  },
  successIcon: {
    width: '3rem',
    height: '3rem',
    color: '#10b981',
    backgroundColor: '#d1fae5',
    borderRadius: '50%',
    padding: '0.75rem',
    flexShrink: 0,
  },
  successTitle: {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 0.5rem 0',
  },
  successText: {
    color: '#6b7280',
    fontSize: '0.875rem',
    margin: '0 0 1rem 0',
    lineHeight: '1.4',
  },
  successButton: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease-in-out',
    textDecoration: 'none',
    display: 'inline-block',
    textAlign: 'center',
  },
};

// Add CSS animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default CustomerSignUp;