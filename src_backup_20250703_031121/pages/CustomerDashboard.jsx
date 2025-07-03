// src/pages/CustomerDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiClock, FiTool, FiCheckCircle, FiAlertCircle, FiLogOut, FiPhone, FiMail, FiMapPin, FiEdit3, FiSave, FiX, FiRefreshCw } from 'react-icons/fi';

import './CustomerDashboard.css';

const CustomerDashboard = ({ setIsCustomerAuthenticated }) => {
  const [customerData, setCustomerData] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [repairsLoading, setRepairsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const navigate = useNavigate();

  // Mock data function
  const getMockRepairs = useCallback(() => [
    {
      id: 'REP001',
      deviceType: 'smartphone',
      deviceBrand: 'Apple',
      deviceModel: 'iPhone 14 Pro',
      issueDescription: 'Cracked Screen',
      status: 'In Progress',
      dateSubmitted: '2025-06-20',
      estimatedCompletion: '2025-06-25',
      technician: 'Mike Johnson',
      cost: 'R2,500',
      serviceType: 'in-store'
    },
    {
      id: 'REP002',
      deviceType: 'laptop',
      deviceBrand: 'Apple',
      deviceModel: 'MacBook Pro 13"',
      issueDescription: 'Battery Replacement',
      status: 'Completed',
      dateSubmitted: '2025-06-15',
      completedDate: '2025-06-18',
      technician: 'Sarah Smith',
      cost: 'R1,800',
      serviceType: 'pickup'
    },
    {
      id: 'REP003',
      deviceType: 'smartphone',
      deviceBrand: 'Samsung',
      deviceModel: 'Galaxy S24',
      issueDescription: 'Water Damage Assessment',
      status: 'Pending Approval',
      dateSubmitted: '2025-06-22',
      estimatedCost: 'R3,200',
      technician: 'David Lee',
      serviceType: 'diagnostic'
    }
  ], []);

  // Fetch customer repairs function
 // Updated fetchCustomerRepairs function for CustomerDashboard.jsx
// Replace the existing fetchCustomerRepairs function with this version

const fetchCustomerRepairs = useCallback(async (customer) => {
  setRepairsLoading(true);
  setError(null);
  setDebugInfo(null);
  
  try {
    console.log('=== FETCHING BOOKINGS/REPAIRS DEBUG ===');
    console.log('Customer object:', customer);
    
    // Try multiple identifiers in priority order
    const identifiers = [
      customer.email,
      customer.username, 
      customer.name,
      customer.full_name,
      customer.id,
      customer.user_id,
      customer.customerId
    ].filter(Boolean); // Remove null/undefined values
    
    console.log('Available identifiers to try:', identifiers);
    
    let successfulResponse = null;
    let allErrors = [];
    
    // Try each identifier until one works
    for (let i = 0; i < identifiers.length; i++) {
      const identifier = identifiers[i];
      
      try {
        console.log(`\n--- Trying identifier ${i + 1}/${identifiers.length}: "${identifier}" ---`);
        
        // Add cache-busting parameter
        const timestamp = new Date().getTime();
        
        // Try both bookings and repairs endpoints
        const endpoints = [
          // First try bookings endpoints (since that's where your data is stored)
          `http://localhost:5000/api/bookings/customer/${encodeURIComponent(identifier)}?timestamp=${timestamp}`,
          `http://localhost:5000/api/customer/bookings/${encodeURIComponent(identifier)}?timestamp=${timestamp}`,
          // Then try repairs endpoints (for backwards compatibility)
          `http://localhost:5000/api/admin/repairs/customer/${encodeURIComponent(identifier)}?timestamp=${timestamp}`,
          `http://localhost:5000/api/repairs/customer/${encodeURIComponent(identifier)}?timestamp=${timestamp}`,
          `http://localhost:5000/api/customer/repairs/${encodeURIComponent(identifier)}?timestamp=${timestamp}`
        ];
        
        for (const url of endpoints) {
          try {
            console.log('Trying URL:', url);
            
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
              },
            });
            
            console.log(`Response status: ${response.status}`);
            
            if (response.ok) {
              const data = await response.json();
              console.log('Success! Response data:', data);
              
              // Validate response structure
              if (data.success !== undefined) {
                successfulResponse = data;
                break; // Success with this endpoint
              } else {
                console.log('Invalid response structure:', data);
              }
            } else {
              const errorText = await response.text();
              console.log(`Failed with status ${response.status}:`, errorText);
              
              // If it's not a 404, it might be a server error worth noting
              if (response.status !== 404) {
                allErrors.push({ 
                  identifier, 
                  endpoint: url, 
                  status: response.status, 
                  error: errorText 
                });
              }
            }
          } catch (endpointError) {
            console.log(`Endpoint error with ${url}:`, endpointError.message);
            allErrors.push({ 
              identifier, 
              endpoint: url, 
              error: endpointError.message 
            });
          }
        }
        
        if (successfulResponse) {
          break; // Exit the identifier loop if we found a successful response
        }
        
      } catch (identifierError) {
        console.log(`Network/fetch error with identifier "${identifier}":`, identifierError.message);
        allErrors.push({ identifier, error: identifierError.message });
      }
    }
    
    if (!successfulResponse) {
      console.log('All identifiers and endpoints failed. Trying direct bookings endpoint...');
      
      // As a fallback, try to get all bookings and filter client-side
      try {
        const response = await fetch('http://localhost:5000/api/bookings', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.bookings) {
            // Filter bookings for current customer
            const customerBookings = data.bookings.filter(booking => {
              return identifiers.some(id => 
                booking.email === id || 
                booking.full_name === id || 
                booking.name === id ||
                booking.username === id ||
                booking.id === id
              );
            });
            
            successfulResponse = {
              success: true,
              repairs: customerBookings, // Use repairs key for compatibility
              bookings: customerBookings,
              customerInfo: customer,
              debug: {
                method: 'client-side-filter',
                totalBookings: data.bookings.length,
                filteredBookings: customerBookings.length
              }
            };
            
            console.log('Filtered bookings found:', customerBookings.length);
          }
        }
      } catch (fallbackError) {
        console.log('Fallback endpoint also failed:', fallbackError.message);
        allErrors.push({ method: 'fallback', error: fallbackError.message });
      }
    }
    
    if (!successfulResponse) {
      console.log('All methods failed. Errors:', allErrors);
      
      // Check if we have database connection issues
      const hasServerErrors = allErrors.some(e => e.status >= 500);
      
      if (hasServerErrors) {
        throw new Error('Server connection issues detected. Please try again later.');
      }
      
      setDebugInfo({
        message: 'No bookings found for any identifier',
        identifiersTried: identifiers,
        errors: allErrors,
        suggestion: 'Check if bookings are linked to your account correctly'
      });
      setRepairs([]);
      return;
    }

    // Process successful response
    if (successfulResponse.success) {
      console.log('Processing bookings/repairs:', successfulResponse.repairs || successfulResponse.bookings);
      
      // Transform bookings data to match expected repair format
      const bookingsData = successfulResponse.repairs || successfulResponse.bookings || [];
      const transformedRepairs = bookingsData.map(booking => ({
        // Map booking fields to repair fields
        id: booking.id || `BOOKING-${Date.now()}`,
        deviceType: booking.device_type || booking.deviceType || 'device',
        deviceBrand: booking.device_brand || booking.deviceBrand || booking.brand,
        deviceModel: booking.device_model || booking.deviceModel || booking.model,
        issueDescription: booking.issue_description || booking.issueDescription || booking.issue || booking.description,
        status: booking.status || 'pending', // Bookings might not have status initially
        dateSubmitted: booking.created_at || booking.dateSubmitted || booking.createdAt,
        estimatedCompletion: booking.preferred_date || booking.estimatedCompletion || booking.estimated_date,
        completedDate: booking.completed_date || booking.completedDate || booking.completion_date,
        technician: booking.technician || booking.assigned_technician || 'To be assigned',
        cost: booking.cost || booking.total_cost || booking.price || 'Quote pending',
        estimatedCost: booking.estimated_cost || booking.estimatedCost || booking.quote,
        serviceType: booking.service_type || booking.serviceType || booking.type || 'in-store',
        
        // Additional booking-specific fields
        fullName: booking.full_name || booking.fullName,
        email: booking.email,
        phone: booking.phone,
        address: booking.address,
        preferredDate: booking.preferred_date || booking.preferredDate,
        preferredTime: booking.preferred_time || booking.preferredTime,
        
        // Keep original fields for compatibility
        ...booking
      }));
      
      setRepairs(transformedRepairs);
      setDebugInfo({
        message: 'Successfully loaded bookings/repairs',
        customerInfo: successfulResponse.customerInfo,
        tableUsed: successfulResponse.debug?.tableUsed || 'bookings',
        repairsCount: transformedRepairs.length,
        searchMethod: successfulResponse.debug?.searchMethod || successfulResponse.debug?.method
      });
    } else {
      throw new Error(successfulResponse.message || 'Failed to fetch bookings/repairs');
    }
    
  } catch (error) {
    console.error('=== BOOKINGS/REPAIRS FETCH ERROR ===');
    console.error('Error details:', error);
    setError(error.message);
    
    // Show mock data in development for testing
    if (process.env.NODE_ENV === 'development') {
      console.log('=== USING MOCK DATA FOR DEVELOPMENT ===');
      const mockRepairs = getMockRepairs();
      setRepairs(mockRepairs);
      setDebugInfo({
        message: 'Using mock data (development mode)',
        mockDataCount: mockRepairs.length,
        originalError: error.message,
        suggestion: 'Check server connection and database setup'
      });
    }
  } finally {
    setRepairsLoading(false);
  }
}, [getMockRepairs]);

  // Refresh repairs function
  const refreshRepairs = useCallback(() => {
    if (customerData) {
      fetchCustomerRepairs(customerData);
    }
  }, [customerData, fetchCustomerRepairs]);

  // Initial data loading effect
  useEffect(() => {
    const loadInitialData = async () => {
      // Get customer data from sessionStorage
      const storedCustomerData = sessionStorage.getItem('customerData');
      if (storedCustomerData) {
        const data = JSON.parse(storedCustomerData);
        console.log('Loaded customer data from sessionStorage:', data);
        setCustomerData(data);
        setEditFormData(data);
        // Fetch repairs for this customer
        await fetchCustomerRepairs(data);
      } else {
        // If no customer data, redirect to login
        navigate('/signin');
        return;
      }
      setLoading(false);
    };

    loadInitialData();
  }, [navigate, fetchCustomerRepairs]);

  // Auto-refresh effect
  useEffect(() => {
    if (!customerData) return;

    const interval = setInterval(() => {
      refreshRepairs();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, [customerData, refreshRepairs]);

  const handleLogout = () => {
    sessionStorage.removeItem('customerData');
    setIsCustomerAuthenticated(false);
    navigate('/');
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setEditFormData(customerData);
    setIsEditingProfile(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    // Validate required fields
    if (!editFormData.name || !editFormData.email || !editFormData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      // Update profile on backend
      const response = await fetch('http://localhost:5000/api/customer/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          ...editFormData,
          originalEmail: customerData.email // To identify the customer
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update local state
          setCustomerData(editFormData);
          sessionStorage.setItem('customerData', JSON.stringify(editFormData));
          setIsEditingProfile(false);
          alert('Profile updated successfully!');
        } else {
          throw new Error(result.message || 'Failed to update profile');
        }
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // Still update locally if backend fails
      setCustomerData(editFormData);
      sessionStorage.setItem('customerData', JSON.stringify(editFormData));
      setIsEditingProfile(false);
      alert('Profile updated locally. Server update failed: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#10b981';
      case 'in progress':
      case 'in-progress':
        return '#f59e0b';
      case 'pending approval':
      case 'pending-approval':
      case 'pending':
        return '#ef4444';
      case 'cancelled':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <FiCheckCircle style={{ color: '#10b981' }} />;
      case 'in progress':
      case 'in-progress':
        return <FiTool style={{ color: '#f59e0b' }} />;
      case 'pending approval':
      case 'pending-approval':
      case 'pending':
        return <FiAlertCircle style={{ color: '#ef4444' }} />;
      default:
        return <FiClock style={{ color: '#6b7280' }} />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getDeviceDisplayName = (repair) => {
    if (repair.deviceBrand && repair.deviceModel) {
      return `${repair.deviceBrand} ${repair.deviceModel}`;
    }
    return repair.deviceModel || repair.deviceBrand || 'Unknown Device';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading customer data...</p>
      </div>
    );
  }

  return (
    <div className="customer-dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <div className="user-icon">
            <FiUser />
          </div>
          <div>
            <h1 className="welcome-title">Welcome back, {customerData.name || customerData.username}!</h1>
            <p className="welcome-subtitle">Track your device repairs and service history</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-button">
          <FiLogOut className="logout-icon" />
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        {/* Debug Info Section (Development Only) */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <div className="debug-section">
            <h3 className="debug-title">Debug Information</h3>
            <pre className="debug-content">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-header">
            <h2 className="section-title">Profile Information</h2>
            {!isEditingProfile && (
              <button onClick={handleEditProfile} className="edit-button">
                <FiEdit3 className="edit-icon" />
                Edit Profile
              </button>
            )}
          </div>
          
          <div className="profile-card">
            {isEditingProfile ? (
              <div className="edit-form">
                <div className="edit-form-grid">
                  <div className="input-group">
                    <label className="input-label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={editFormData.phone || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={editFormData.address || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your address"
                    />
                  </div>
                  <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label className="input-label">Company (Optional)</label>
                    <input
                      type="text"
                      name="company"
                      value={editFormData.company || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your company name"
                    />
                  </div>
                </div>
                <div className="edit-form-actions">
                  <button onClick={handleSaveProfile} className="save-button">
                    <FiSave className="button-icon" />
                    Save Changes
                  </button>
                  <button onClick={handleCancelEdit} className="cancel-button">
                    <FiX className="button-icon" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-details">
                <div className="profile-item">
                  <FiUser className="profile-icon" />
                  <div>
                    <span className="profile-label">Name:</span>
                    <span className="profile-value">{customerData.name || customerData.username}</span>
                  </div>
                </div>
                <div className="profile-item">
                  <FiMail className="profile-icon" />
                  <div>
                    <span className="profile-label">Email:</span>
                    <span className="profile-value">{customerData.email}</span>
                  </div>
                </div>
                <div className="profile-item">
                  <FiPhone className="profile-icon" />
                  <div>
                    <span className="profile-label">Phone:</span>
                    <span className="profile-value">{customerData.phone || 'Not provided'}</span>
                  </div>
                </div>
                <div className="profile-item">
                  <FiMapPin className="profile-icon" />
                  <div>
                    <span className="profile-label">Address:</span>
                    <span className="profile-value">{customerData.address || 'Not provided'}</span>
                  </div>
                </div>
                {customerData.company && (
                  <div className="profile-item">
                    <FiUser className="profile-icon" />
                    <div>
                      <span className="profile-label">Company:</span>
                      <span className="profile-value">{customerData.company}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FiTool style={{ color: '#0d9488' }} />
            </div>
            <div>
              <h3 className="stat-number">{repairs.length}</h3>
              <p className="stat-label">Total Repairs</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FiClock style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <h3 className="stat-number">
                {repairs.filter(r => r.status?.toLowerCase().includes('progress')).length}
              </h3>
              <p className="stat-label">In Progress</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FiCheckCircle style={{ color: '#10b981' }} />
            </div>
            <div>
              <h3 className="stat-number">
                {repairs.filter(r => r.status?.toLowerCase() === 'completed').length}
              </h3>
              <p className="stat-label">Completed</p>
            </div>
          </div>
        </div>

        {/* Repairs List */}
        <div className="repairs-section">
          <div className="repairs-header">
            <h2 className="section-title">Your Repairs</h2>
            <button 
              onClick={refreshRepairs} 
              className="refresh-button"
              disabled={repairsLoading}
            >
              <FiRefreshCw className={`refresh-icon ${repairsLoading ? 'spinning' : ''}`} />
              Refresh
            </button>
          </div>
          
          {error && (
            <div className="error-message">
              <FiAlertCircle className="error-icon" />
              <div>
                <p><strong>Error loading repairs:</strong> {error}</p>
                {debugInfo && (
                  <details className="error-details">
                    <summary>Debug Information</summary>
                    <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                  </details>
                )}
              </div>
              <button onClick={refreshRepairs} className="retry-button">
                Try Again
              </button>
            </div>
          )}

          {repairsLoading ? (
            <div className="loading-repairs">
              <div className="loading-spinner"></div>
              <p>Loading your repairs...</p>
            </div>
          ) : repairs.length === 0 ? (
            <div className="no-repairs">
              <FiTool className="no-repairs-icon" />
              <h3>No repairs found</h3>
              <p>You haven't submitted any repair requests yet.</p>
              {debugInfo && (
                <details className="debug-details">
                  <summary>Debug Information</summary>
                  <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                </details>
              )}
              <button 
                onClick={() => navigate('/book-repair')}
                className="book-repair-button"
              >
                Book a Repair
              </button>
            </div>
          ) : (
            <div className="repairs-list">
              {repairs.map(repair => (
                <div key={repair.id} className="repair-card">
                  <div className="repair-header">
                    <div className="repair-info">
                      <h3 className="repair-device">{getDeviceDisplayName(repair)}</h3>
                      <p className="repair-issue">{repair.issueDescription || repair.issue}</p>
                      <p className="repair-id">Repair ID: {repair.id}</p>
                    </div>
                    <div className="repair-status">
                      {getStatusIcon(repair.status)}
                      <span className="status-text" style={{ color: getStatusColor(repair.status) }}>
                        {repair.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="repair-details">
                    <div className="detail-item">
                      <span className="detail-label">Submitted:</span>
                      <span className="detail-value">
                        {formatDate(repair.dateSubmitted || repair.createdAt)}
                      </span>
                    </div>
                    {repair.estimatedCompletion && (
                      <div className="detail-item">
                        <span className="detail-label">Est. Completion:</span>
                        <span className="detail-value">
                          {formatDate(repair.estimatedCompletion)}
                        </span>
                      </div>
                    )}
                    {repair.completedDate && (
                      <div className="detail-item">
                        <span className="detail-label">Completed:</span>
                        <span className="detail-value">
                          {formatDate(repair.completedDate)}
                        </span>
                      </div>
                    )}
                    {repair.technician && (
                      <div className="detail-item">
                        <span className="detail-label">Technician:</span>
                        <span className="detail-value">{repair.technician}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">Service Type:</span>
                      <span className="detail-value">
                        {repair.serviceType ? repair.serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Cost:</span>
                      <span className="detail-value">
                        {repair.cost || repair.estimatedCost || 'TBD'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="contact-section">
          <h2 className="section-title">Need Help?</h2>
          <div className="contact-grid">
            <div className="contact-card">
              <FiPhone className="contact-icon" />
              <div>
                <h4 className="contact-title">Call Us</h4>
                <p className="contact-detail">+27 73 527 0565</p>
              </div>
            </div>
            <div className="contact-card">
              <FiMail className="contact-icon" />
              <div>
                <h4 className="contact-title">Email</h4>
                <p className="contact-detail">support@stentech.co.za</p>
              </div>
            </div>
            <div className="contact-card">
              <FiMapPin className="contact-icon" />
              <div>
                <h4 className="contact-title">Visit Us</h4>
                <p className="contact-detail">2 Aubrey Matlakala St, Pretoria, 0152</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;