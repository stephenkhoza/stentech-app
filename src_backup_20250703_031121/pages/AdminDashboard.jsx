import React, { useEffect, useState, useCallback, useMemo } from 'react';
import './AdminDashboard.css';

// Configuration
const API_CONFIG = {
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
};

// Fixed API utilities - removed duplicate function definition
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  console.log('Making API call to:', url);
  console.log('Request options:', options);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('Response data:', responseData);
    return responseData;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`API call failed: ${url}`, error);
    throw error;
  }
};

// Data normalization utilities
const normalizeBooking = (booking) => ({
  id: booking.id || booking._id,
  customerName: booking.full_name || booking.customerName || '',
  customerEmail: booking.email || booking.customerEmail || '',
  customerPhone: booking.phone || booking.customerPhone || '',
  deviceBrand: booking.device_brand || booking.deviceBrand || '',
  deviceModel: booking.device_model || booking.deviceModel || '',
  issueDescription: booking.issue_description || booking.issueDescription || '',
  serviceType: booking.service_type || booking.serviceType || '',
  status: booking.status || 'pending',
  preferredDate: booking.preferred_date || booking.preferredDate || '',
  preferredTime: booking.preferred_time || booking.preferredTime || '',
  cost: booking.final_cost || booking.estimated_cost || booking.cost || 'TBD',
  imageCount: booking.image_count || 0,
  technician: booking.technician || 'Unassigned',
  createdAt: booking.created_at || booking.createdAt || booking.dateSubmitted || '',
  completedAt: booking.completed_at || booking.completedAt || '',
  cancelledAt: booking.cancelled_at || booking.cancelledAt || '',
  cancellationReason: booking.cancellation_reason || booking.cancellationReason || '',
});

const normalizeCustomer = (customer) => ({
  id: customer.id || customer._id,
  name: customer.name || customer.first_name + ' ' + customer.surname || '',
  email: customer.email || '',
  phone: customer.phone || '',
  address: customer.address || 'Not provided',
  totalRepairs: customer.total_repairs || 0,
  lastRepair: customer.last_repair || null,
  createdAt: customer.created_at || '',
});

// Mock data
const getMockData = () => ({
  bookings: [
    {
      id: 1,
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+27 82 123 4567',
      device_brand: 'Apple',
      device_model: 'iPhone 14 Pro',
      issue_description: 'Screen completely shattered, touch not responsive in upper half',
      preferred_date: '2025-06-25',
      preferred_time: '10:00 AM',
      service_type: 'Screen Replacement',
      status: 'pending',
      image_count: 3,
      created_at: '2025-06-20T10:30:00Z',
      estimated_cost: 'R2,500'
    },
    {
      id: 2,
      full_name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+27 83 987 6543',
      device_brand: 'Samsung',
      device_model: 'Galaxy S23 Ultra',
      issue_description: 'Battery drains very quickly, needs replacement',
      preferred_date: '2025-06-26',
      preferred_time: '2:00 PM',
      service_type: 'Battery Replacement',
      status: 'confirmed',
      image_count: 1,
      created_at: '2025-06-21T14:15:00Z',
      estimated_cost: 'R1,800'
    },
    {
      id: 3,
      full_name: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      phone: '+27 84 456 7890',
      device_brand: 'Google',
      device_model: 'Pixel 7 Pro',
      issue_description: 'Main camera not focusing, produces blurry images',
      preferred_date: '2025-06-27',
      preferred_time: '11:30 AM',
      service_type: 'Camera Repair',
      status: 'in_progress',
      image_count: 4,
      created_at: '2025-06-22T09:20:00Z',
      estimated_cost: 'R2,200',
      technician: 'Sarah Wilson'
    },
    {
      id: 4,
      full_name: 'Sarah Wilson',
      email: 'sarah.wilson@gmail.com',
      phone: '+27 85 234 5678',
      device_brand: 'OnePlus',
      device_model: '11 Pro 5G',
      issue_description: 'Charging port damaged, phone won\'t charge',
      preferred_date: '2025-06-28',
      preferred_time: '3:15 PM',
      service_type: 'Charging Port Repair',
      status: 'completed',
      image_count: 2,
      created_at: '2025-06-23T16:45:00Z',
      completed_at: '2025-06-24T11:30:00Z',
      final_cost: 'R1,500',
      technician: 'Mike Chen'
    },
    {
      id: 5,
      full_name: 'David Lee',
      email: 'david.lee@company.com',
      phone: '+27 86 345 6789',
      device_brand: 'Apple',
      device_model: 'MacBook Air M2',
      issue_description: 'Liquid spill damage, keyboard and trackpad not working',
      preferred_date: '2025-06-24',
      preferred_time: '9:00 AM',
      service_type: 'Water Damage Repair',
      status: 'cancelled',
      image_count: 5,
      created_at: '2025-06-19T08:45:00Z',
      cancelled_at: '2025-06-20T10:15:00Z',
      cancellation_reason: 'Customer decided to buy new device'
    }
  ],
  customers: [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+27 82 123 4567',
      address: '123 Main St, Pretoria',
      created_at: '2025-01-15T10:30:00Z',
      total_repairs: 2,
      last_repair: '2025-06-20T10:30:00Z'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+27 83 987 6543',
      address: '456 Oak Ave, Johannesburg',
      created_at: '2025-02-10T14:15:00Z',
      total_repairs: 1,
      last_repair: '2025-06-21T14:15:00Z'
    }
  ]
});

// Custom hooks
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const useNotification = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  return { notification, showNotification };
};

// Components
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="page-container">
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-text">{message}</p>
    </div>
  </div>
);

// Utility functions
const getStatusOptions = (currentStatus) => {
  const allStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
  return allStatuses.filter(status => status !== currentStatus);
};

// Debug functions for testing API endpoints
const debugApiEndpoints = async () => {
  const testEndpoints = [
    '/api/admin/bookings',
    '/api/bookings',
    '/admin/bookings',
    '/api/admin/booking',
    '/api/v1/admin/bookings',
    '/bookings'
  ];

  console.log('=== API Endpoint Debugging ===');
  console.log('Base URL:', API_CONFIG.baseUrl);
  
  for (const endpoint of testEndpoints) {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin-auth')}`,
        },
      });
      
      console.log(`✅ ${endpoint}: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log(`   Found working endpoint: ${endpoint}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
  
  console.log('=== End Debug ===');
};

const debugUpdateEndpoints = async (bookingId = 1) => {
  const testEndpoints = [
    `/api/admin/bookings/${bookingId}/status`,
    `/api/admin/bookings/${bookingId}`,
    `/api/bookings/${bookingId}/status`,
    `/api/bookings/${bookingId}`,
    `/admin/bookings/${bookingId}/status`,
    `/admin/bookings/${bookingId}`,
    `/bookings/${bookingId}/status`,
    `/bookings/${bookingId}`
  ];

  console.log('=== Update Endpoint Debugging ===');
  console.log('Testing booking ID:', bookingId);
  
  const testData = { status: 'confirmed' };
  
  for (const endpoint of testEndpoints) {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin-auth')}`,
        },
        body: JSON.stringify(testData)
      });
      
      console.log(`✅ PUT ${endpoint}: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log(`   Found working UPDATE endpoint: ${endpoint}`);
        return endpoint;
      }
    } catch (error) {
      console.log(`❌ PUT ${endpoint}: ${error.message}`);
    }
  }
  
  // Also try PATCH method
  for (const endpoint of testEndpoints) {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin-auth')}`,
        },
        body: JSON.stringify(testData)
      });
      
      console.log(`✅ PATCH ${endpoint}: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        console.log(`   Found working PATCH endpoint: ${endpoint}`);
        return endpoint;
      }
    } catch (error) {
      console.log(`❌ PATCH ${endpoint}: ${error.message}`);
    }
  }
  
  console.log('=== End Update Debug ===');
  return null;
};

// Main component
const AdminDashboard = ({ setIsAuthenticated }) => {
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState('bookings');
  const [error, setError] = useState(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const { notification, showNotification } = useNotification();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Data fetching
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiCall('/api/admin/bookings');
      const rawBookings = data.bookings || data.data || (Array.isArray(data) ? data : []);
      const normalizedBookings = rawBookings.map(normalizeBooking);
      
      setBookings(normalizedBookings);
      setIsUsingMockData(false);
      showNotification(`Loaded ${normalizedBookings.length} bookings from database`, 'success');
      
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setError(error.message);
      
      // Fallback to mock data
      const mockData = getMockData();
      const normalizedBookings = mockData.bookings.map(normalizeBooking);
      setBookings(normalizedBookings);
      setIsUsingMockData(true);
      showNotification(`Using demo data: ${normalizedBookings.length} bookings loaded`, 'warning');
      
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const fetchCustomers = useCallback(async () => {
    try {
      const data = await apiCall('/api/admin/customers');
      const rawCustomers = data.customers || data.data || (Array.isArray(data) ? data : []);
      const normalizedCustomers = rawCustomers.map(normalizeCustomer);
      
      setCustomers(normalizedCustomers);
      
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      
      // Fallback to mock data
      const mockData = getMockData();
      const normalizedCustomers = mockData.customers.map(normalizeCustomer);
      setCustomers(normalizedCustomers);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchCustomers();
  }, [fetchBookings, fetchCustomers]);

  // Filtered and sorted bookings
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    // Search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.customerName.toLowerCase().includes(searchLower) ||
        booking.customerEmail.toLowerCase().includes(searchLower) ||
        booking.deviceBrand.toLowerCase().includes(searchLower) ||
        booking.deviceModel.toLowerCase().includes(searchLower) ||
        booking.issueDescription.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(booking => {
            const bookingDate = new Date(booking.createdAt);
            return bookingDate >= filterDate;
          });
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(booking => {
            const bookingDate = new Date(booking.createdAt);
            return bookingDate >= filterDate;
          });
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(booking => {
            const bookingDate = new Date(booking.createdAt);
            return bookingDate >= filterDate;
          });
          break;
        default:
          break;
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name':
          return a.customerName.localeCompare(b.customerName);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [bookings, debouncedSearchTerm, statusFilter, dateFilter, sortBy]);

  // Event handlers
  const handleLogout = () => {
    if (setIsAuthenticated) {
      setIsAuthenticated(false);
    } else {
      alert('Logged out successfully!');
    }
  };

  // Fixed handleStatusChange with proper endpoint handling
  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdatingStatus(bookingId);

    const updateData = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === 'completed') {
      updateData.completed_at = new Date().toISOString();
    } else if (newStatus === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString();
    }

    try {
      // Try the specific status endpoint first (matches your backend route)
      let endpoint = `/api/admin/bookings/${bookingId}/status`;
      
      try {
        await apiCall(endpoint, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin-auth')}`,
          },
          body: JSON.stringify({ status: newStatus }), // Send only status for the /status endpoint
        });
      } catch (error) {
        if (error.message.includes('404')) {
          console.log('Status endpoint failed, trying alternatives...');
          
          // Try alternative endpoints with full update data
          const alternatives = [
            { endpoint: `/api/admin/bookings/${bookingId}`, method: 'PUT' },
            { endpoint: `/api/admin/bookings/${bookingId}`, method: 'PATCH' },
            { endpoint: `/api/bookings/${bookingId}/status`, method: 'PUT' },
            { endpoint: `/api/bookings/${bookingId}`, method: 'PUT' },
            { endpoint: `/admin/bookings/${bookingId}/status`, method: 'PUT' },
            { endpoint: `/admin/bookings/${bookingId}`, method: 'PUT' },
            { endpoint: `/bookings/${bookingId}/status`, method: 'PUT' },
            { endpoint: `/bookings/${bookingId}`, method: 'PUT' }
          ];
          
          let success = false;
          for (const { endpoint: altEndpoint, method } of alternatives) {
            try {
              const requestBody = altEndpoint.includes('/status') 
                ? { status: newStatus } 
                : updateData;
                
              await apiCall(altEndpoint, {
                method: method,
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('admin-auth')}`,
                },
                body: JSON.stringify(requestBody),
              });
              console.log(`✅ Found working endpoint: ${method} ${altEndpoint}`);
              success = true;
              break;
            } catch (altError) {
              console.log(`❌ ${method} ${altEndpoint} failed:`, altError.message);
            }
          }
          
          if (!success) {
            throw error; // Re-throw original error if no alternatives work
          }
        } else {
          throw error;
        }
      }

      // Update local state
      setBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: newStatus, ...updateData }
            : booking
        )
      );

      showNotification(`Booking status updated to ${newStatus.replace('_', ' ')}`, 'success');

    } catch (error) {
      console.error('Status update failed:', error);
      
      let errorMessage = 'Failed to update status. ';
      
      if (error.message.includes('404')) {
        errorMessage += 'API endpoint not found. Please check your backend routes.';
        console.log('💡 Try running debugApiEndpoints() in console to find correct endpoint');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        errorMessage += 'Authentication failed. Please log in again.';
      } else if (error.message.includes('500')) {
        errorMessage += 'Server error. Please check server logs.';
      } else {
        errorMessage += `${error.message}`;
      }

      showNotification(errorMessage, 'error');

      // Fallback to local update if using mock data
      if (isUsingMockData) {
        setBookings(prev =>
          prev.map(booking =>
            booking.id === bookingId
              ? { ...booking, status: newStatus, ...updateData }
              : booking
          )
        );
        showNotification(`Status updated locally (demo mode): ${newStatus.replace('_', ' ')}`, 'warning');
      }
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleRefresh = () => {
    fetchBookings();
    fetchCustomers();
  };

  const handleViewDetails = (booking) => {
    const formatDate = (dateString) => {
      if (!dateString) return 'Not provided';
      try {
        return new Date(dateString).toLocaleString();
      } catch {
        return dateString;
      }
    };

    const details = `Booking Details:
━━━━━━━━━━━━━━━━━━━━
ID: ${booking.id}
Customer: ${booking.customerName}
Email: ${booking.customerEmail}
Phone: ${booking.customerPhone || 'Not provided'}
Device: ${booking.deviceBrand} ${booking.deviceModel}
Issue: ${booking.issueDescription}
Service: ${booking.serviceType}
Status: ${booking.status}
Preferred Date: ${booking.preferredDate}
Preferred Time: ${booking.preferredTime}
Cost: ${booking.cost}
Technician: ${booking.technician}
Images: ${booking.imageCount}
Created: ${formatDate(booking.createdAt)}${booking.completedAt ? `
Completed: ${formatDate(booking.completedAt)}` : ''}${booking.cancelledAt ? `
Cancelled: ${formatDate(booking.cancelledAt)}` : ''}${booking.cancellationReason ? `
Reason: ${booking.cancellationReason}` : ''}`;

    alert(details);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('all');
    setSortBy('newest');
  };

  const exportToCSV = () => {
    if (filteredBookings.length === 0) {
      showNotification('No bookings to export', 'warning');
      return;
    }

    const csvData = filteredBookings.map(booking => ({
      ID: booking.id,
      Customer: booking.customerName,
      Email: booking.customerEmail,
      Phone: booking.customerPhone,
      Device: `${booking.deviceBrand} ${booking.deviceModel}`.trim(),
      Issue: booking.issueDescription,
      'Service Type': booking.serviceType,
      Status: booking.status,
      'Created Date': new Date(booking.createdAt).toLocaleDateString(),
      'Preferred Date': booking.preferredDate,
      'Preferred Time': booking.preferredTime,
      Cost: booking.cost,
      Technician: booking.technician
    }));

    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row =>
      Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    );
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `bookings-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showNotification('Export completed', 'success');
  };

  // Make debug functions available globally for console debugging
  useEffect(() => {
    window.debugApiEndpoints = debugApiEndpoints;
    window.debugUpdateEndpoints = debugUpdateEndpoints;
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard data..." />;
  }

  return (
    <div className="page-container">
      <div className="fixed-header">
        <div className="header-content">
          <div>
            <h1 className="main-title">Admin Dashboard</h1>
            <p className="subtitle">
              Manage repair bookings and customers • Total: {bookings.length} bookings, {customers.length} customers
              {isUsingMockData && <span className="demo-badge"> • Demo Mode</span>}
            </p>
          </div>
          <div className="header-actions">
            <button onClick={() => { debugApiEndpoints(); debugUpdateEndpoints(1); }} className="debug-button">
              🔧 Debug API
            </button>
            <button onClick={exportToCSV} className="export-button">
              📊 Export CSV
            </button>
            <button onClick={handleRefresh} className="refresh-button">
              🔄 Refresh
            </button>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Notification */}
        {notification && (
          <div className={`notification notification-${notification.type}`}>
            {notification.message}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-banner">
            <div className="error-content">
              <strong>⚠️ Database Connection Issue:</strong> {error}
              <button onClick={handleRefresh} className="retry-button">
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            📋 Bookings ({bookings.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            👥 Customers ({customers.length})
          </button>
        </div>

        {activeTab === 'bookings' && (
          <>
            {/* Filters and Search */}
            <div className="filters-container">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search by name, email, device, or issue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="filters-row">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Sort by Name</option>
                  <option value="status">Sort by Status</option>
                </select>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#2563eb' }}>{bookings.length}</div>
                <div className="stat-label">Total Bookings</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#d97706' }}>
                  {bookings.filter(b => (b.status || '').toLowerCase() === 'pending').length}
                </div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#2563eb' }}>
                  {bookings.filter(b => (b.status || '').toLowerCase() === 'confirmed').length}
                </div>
                <div className="stat-label">Confirmed</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#be185d' }}>
                  {bookings.filter(b => (b.status || '').toLowerCase() === 'in_progress').length}
                </div>
                <div className="stat-label">In Progress</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#059669' }}>
                  {bookings.filter(b => (b.status || '').toLowerCase() === 'completed').length}
                </div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#dc2626' }}>
                  {bookings.filter(b => (b.status || '').toLowerCase() === 'cancelled').length}
                </div>
                <div className="stat-label">Cancelled</div>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="table-container">
              <div className="table-header">
                <h2 className="table-title">
                  All Bookings ({filteredBookings.length})
                </h2>
                <div className="legend">
                  <span className="legend-text">Data from database • Click status to update</span>
                </div>
              </div>

              <div className="table-wrapper">
                <div className="scrollable-table">
                  <table className="table">
                    <thead className="sticky-table-head">
                      <tr>
                        <th className="th">ID</th>
                        <th className="th">Customer</th>
                        <th className="th">Device</th>
                        <th className="th">Issue</th>
                        <th className="th">Schedule</th>
                        <th className="th">Service</th>
                        <th className="th">Status</th>
                        <th className="th">Cost</th>
                        <th className="th">Images</th>
                        <th className="th">Technician</th>
                        <th className="th">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking) => (
                        <tr key={booking.id || booking._id} className="tr">
                          <td className="td">
                            <div className="booking-id">#{booking.id || booking._id}</div>
                          </td>
                          <td className="td">
                            <div className="customer-name">{booking.customerName}</div>
                            <div className="customer-email">{booking.customerEmail}</div>
                            {booking.customerPhone && (
                              <div className="customer-phone">{booking.customerPhone}</div>
                            )}
                          </td>
                          <td className="td">
                            <div className="device-info">
                              <strong>{booking.deviceBrand}</strong><br />
                              {booking.deviceModel}
                            </div>
                          </td>
                          <td className="td">
                            <div className="issue-description">{booking.issueDescription}</div>
                          </td>
                          <td className="td">
                            <div className="schedule-date">{booking.preferredDate}</div>
                            <div className="schedule-time">{booking.preferredTime}</div>
                          </td>
                          <td className="td">{booking.serviceType}</td>
                          <td className="td">
                            <div className="status-container">
                              <span className={`status-badge status-${booking.status}`}>
                                {updatingStatus === (booking.id || booking._id) ? (
                                  <>
                                    <span className="mini-spinner animate-spin mr-1">⟳</span> Updating...
                                  </>
                                ) : (
                                  (booking.status || 'unknown').replace('_', ' ')
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="td">
                            <div className="cost-info">{booking.cost}</div>
                          </td>
                          <td className="td">
                            <div className="image-count">
                              {booking.imageCount} {booking.imageCount > 0 && <span className="image-icon">📷</span>}
                            </div>
                          </td>
                          <td className="td">
                            <div className="technician-info">{booking.technician}</div>
                          </td>
                          <td className="td">
                            <div className="action-buttons">
                              <select
                                className="status-select"
                                value={booking.status}
                                onChange={(e) => handleStatusChange(booking.id || booking._id, e.target.value)}
                                disabled={updatingStatus === (booking.id || booking._id)}
                              >
                                <option value={booking.status}>
                                  {(booking.status || 'unknown').replace('_', ' ')}
                                </option>
                                {getStatusOptions(booking.status).map(status => (
                                  <option key={status} value={status}>
                                    {status.replace('_', ' ')}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleViewDetails(booking)}
                                className="view-button"
                                title="View full details"
                              >
                                👁️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {filteredBookings.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No bookings found</h3>
                  <p>
                    {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                      ? 'Try adjusting your filters or search terms.'
                      : 'No repair bookings have been submitted yet.'
                    }
                  </p>
                  {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
                    <button onClick={clearAllFilters} className="clear-filters-button">
                      Clear All Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'customers' && (
          <div className="customers-section">
            <div className="table-container">
              <div className="table-header">
                <h2 className="table-title">
                
                  All Customers ({customers.length})
                </h2>
                <div className="legend">
                  <span className="legend-text">Customer database records</span>
                </div>
              </div>

              <div className="table-wrapper">
                <div className="scrollable-table">
                  <table className="table">
                    <thead className="sticky-table-head">
                      <tr>
                        <th className="th">ID</th>
                        <th className="th">Name</th>
                        <th className="th">Contact</th>
                        <th className="th">Address</th>
                        <th className="th">Total Repairs</th>
                        <th className="th">Last Repair</th>
                        <th className="th">Customer Since</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id || customer._id} className="tr">
                          <td className="td">
                            <div className="booking-id">#{customer.id || customer._id}</div>
                          </td>
                          <td className="td">
                            <div className="customer-name">{customer.name}</div>
                          </td>
                          <td className="td">
                            <div className="customer-email">{customer.email}</div>
                            {customer.phone && (
                              <div className="customer-phone">{customer.phone}</div>
                            )}
                          </td>
                          <td className="td">
                            <div className="customer-address">{customer.address}</div>
                          </td>
                          <td className="td">
                            <div className="repair-count">{customer.totalRepairs}</div>
                          </td>
                          <td className="td">
                            <div className="last-repair">
                              {customer.lastRepair 
                                ? new Date(customer.lastRepair).toLocaleDateString()
                                : 'No repairs yet'
                              }
                            </div>
                          </td>
                          <td className="td">
                            <div className="created-date">
                              {customer.createdAt 
                                ? new Date(customer.createdAt).toLocaleDateString()
                                : 'Unknown'
                              }
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {customers.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h3>No customers found</h3>
                  <p>No customer records have been created yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};




export default AdminDashboard;