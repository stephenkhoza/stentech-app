import React, { useState } from 'react';

const BookRepair = () => {
  const [selectedDevice, setSelectedDevice] = useState('smartphone');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({
    deviceType: 'smartphone',
    deviceBrand: '',
    deviceModel: '',
    issueDescription: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    preferredDate: '',
    preferredTime: '',
    serviceType: '',
    termsCheck: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDeviceSelect = (deviceType) => {
    setSelectedDevice(deviceType);
    setFormData(prev => ({ ...prev, deviceType }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  // Replace the handleSubmit function in your BookRepair component
// Replace the handleSubmit function in your BookRepair component
const handleSubmit = async () => {
  console.log('Submit initiated');
  
  if (!formData.termsCheck) {
    alert('Please accept the terms and conditions to proceed.');
    return;
  }
  
  const requiredFields = ['fullName', 'email', 'phone', 'preferredDate', 'preferredTime', 'serviceType'];
  const missingFields = requiredFields.filter(field => !formData[field]);
  
  if (missingFields.length > 0) {
    alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
    return;
  }
  
  try {
    const submitData = new FormData();
    
    // Add form data
    Object.keys(formData).forEach(key => {
      if (key !== 'termsCheck') {
        submitData.append(key, formData[key]);
        console.log(`Added field: ${key} = ${formData[key]}`);
      }
    });
    
    // Add files
    selectedFiles.forEach((file, index) => {
      submitData.append('images', file);
      console.log(`Added file ${index}: ${file.name}`);
    });
    
    console.log('Sending request to: http://localhost:5000/api/bookings');
    
    const response = await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      body: submitData,
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Response data:', result);
    
    if (result.success) {
      alert('Repair booking submitted successfully!');
      // Reset form
      setFormData({
        deviceType: 'smartphone',
        deviceBrand: '',
        deviceModel: '',
        issueDescription: '',
        fullName: '',
        email: '',
        phone: '',
        address: '',
        preferredDate: '',
        preferredTime: '',
        serviceType: '',
        termsCheck: false
      });
      setSelectedFiles([]);
      setSelectedDevice('smartphone');
    } else {
      alert('Error: ' + (result.message || 'Unknown error occurred'));
    }
  } catch (error) {
    console.error('Detailed error submitting booking:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      alert('Error: Cannot connect to server. Please check if the server is running on port 5000.');
    } else if (error.message.includes('non-JSON response')) {
      alert('Error: Server returned an invalid response. Please check server logs.');
    } else {
      alert('Error submitting booking: ' + error.message);
    }
  }
};
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      
    },
    section: {
      paddingTop: '160px',
      paddingBottom: '80px',
      paddingLeft: '16px',
      paddingRight: '16px',
    },
    maxWidth: {
      maxWidth: '896px',
      margin: '0 auto',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
    },
    header: {
      backgroundColor: '#14b8a6',
      color: 'white',
      padding: '24px',
      textAlign: 'center',
    },
    headerTitle: {
      fontSize: '30px',
      fontWeight: 'bold',
      marginBottom: '8px',
      margin: '0 0 8px 0',
    },
    headerSubtitle: {
      color: '#a7f3d0',
      margin: '0',
    },
    content: {
      padding: '32px',
    },
    formContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '16px',
      color: '#1f2937',
      margin: '0 0 16px 0',
    },
    deviceGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
    },
    deviceGridMd: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
    },
    deviceCard: {
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: 'white',
    },
    deviceCardSelected: {
      border: '2px solid #14b8a6',
      backgroundColor: '#f0fdfa',
    },
    deviceCardHover: {
      borderColor: '#5eead4',
      backgroundColor: '#f9fafb',
    },
    deviceContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    deviceIcon: {
      fontSize: '24px',
    },
    deviceLabel: {
      fontWeight: '500',
      color: '#374151',
    },
    inputGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '16px',
    },
    inputGridMd: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    inputGroupSpan2: {
      gridColumn: 'span 2',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxSizing: 'border-box',
    },
    inputFocus: {
      borderColor: '#14b8a6',
      boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.1)',
    },
    textarea: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxSizing: 'border-box',
      resize: 'vertical',
      minHeight: '80px',
    },
    select: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxSizing: 'border-box',
      backgroundColor: 'white',
    },
    fileUploadContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    fileUploadButton: {
      backgroundColor: '#14b8a6',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      border: 'none',
      fontSize: '14px',
      transition: 'background-color 0.2s',
    },
    fileUploadButtonHover: {
      backgroundColor: '#0f766e',
    },
    fileUploadText: {
      color: '#6b7280',
      fontSize: '14px',
    },
    fileUploadHelp: {
      fontSize: '12px',
      color: '#9ca3af',
      marginTop: '4px',
    },
    hiddenInput: {
      display: 'none',
    },
    termsContainer: {
      borderTop: '1px solid #e5e7eb',
      paddingTop: '24px',
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
    },
    checkbox: {
      marginTop: '4px',
      width: '16px',
      height: '16px',
      accentColor: '#14b8a6',
    },
    termsText: {
      fontSize: '14px',
      color: '#374151',
    },
    link: {
      color: '#14b8a6',
      textDecoration: 'underline',
    },
    linkHover: {
      color: '#0f766e',
    },
    submitContainer: {
      textAlign: 'center',
      paddingTop: '16px',
    },
    submitButton: {
      backgroundColor: '#14b8a6',
      color: 'white',
      padding: '12px 32px',
      borderRadius: '6px',
      fontSize: '18px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    submitButtonHover: {
      backgroundColor: '#0f766e',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-2px)',
    },
    submitButtonDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
    submitHelp: {
      fontSize: '12px',
      color: '#9ca3af',
      marginTop: '8px',
    },
  };

  return (
    <div style={styles.container}>
      <section style={styles.section}>
        <div style={styles.maxWidth}>
          <div style={styles.card}>
            {/* Header */}
            <div style={styles.header}>
              <h1 style={styles.headerTitle}>Book Your Device Repair</h1>
              <p style={styles.headerSubtitle}>Fill out the form below to schedule a repair with our expert technicians</p>
            </div>
            
            {/* Booking Content */}
            <div style={styles.content}>
              <div style={styles.formContainer}>
                {/* Device Selection Section */}
                <div>
                  <h3 style={styles.sectionTitle}>1. Select Your Device Type</h3>
                  <div style={window.innerWidth >= 768 ? styles.deviceGridMd : styles.deviceGrid}>
                    {[
                      { id: 'smartphone', icon: '📱', label: 'Smartphone' },
                      { id: 'tablet', icon: '📱', label: 'Tablet' },
                      { id: 'laptop', icon: '💻', label: 'Laptop' },
                      { id: 'desktop', icon: '🖥️', label: 'Desktop' }
                    ].map((device) => (
                      <div
                        key={device.id}
                        style={{
                          ...styles.deviceCard,
                          ...(selectedDevice === device.id ? styles.deviceCardSelected : {}),
                        }}
                        onClick={() => handleDeviceSelect(device.id)}
                        onMouseEnter={(e) => {
                          if (selectedDevice !== device.id) {
                            Object.assign(e.target.style, styles.deviceCardHover);
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedDevice !== device.id) {
                            Object.assign(e.target.style, styles.deviceCard);
                          }
                        }}
                      >
                        <div style={styles.deviceContent}>
                          <span style={styles.deviceIcon}>{device.icon}</span>
                          <span style={styles.deviceLabel}>{device.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Device Details Section */}
                <div>
                  <h3 style={styles.sectionTitle}>2. Device Details</h3>
                  <div style={window.innerWidth >= 768 ? styles.inputGridMd : styles.inputGrid}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Brand</label>
                      <input
                        type="text"
                        name="deviceBrand"
                        value={formData.deviceBrand}
                        onChange={handleInputChange}
                        placeholder="e.g. Apple, Samsung, HP"
                        style={styles.input}
                        onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                        onBlur={(e) => Object.assign(e.target.style, styles.input)}
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Model</label>
                      <input
                        type="text"
                        name="deviceModel"
                        value={formData.deviceModel}
                        onChange={handleInputChange}
                        placeholder="e.g. iPhone 12, Galaxy S21"
                        style={styles.input}
                        onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                        onBlur={(e) => Object.assign(e.target.style, styles.input)}
                      />
                    </div>
                    <div style={{...styles.inputGroup, ...styles.inputGroupSpan2}}>
                      <label style={styles.label}>Describe the Issue</label>
                      <textarea
                        name="issueDescription"
                        value={formData.issueDescription}
                        onChange={handleInputChange}
                        placeholder="Please provide details about the problem with your device"
                        style={styles.textarea}
                        onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                        onBlur={(e) => Object.assign(e.target.style, styles.textarea)}
                      />
                    </div>
                    <div style={{...styles.inputGroup, ...styles.inputGroupSpan2}}>
                      <label style={styles.label}>Upload Images (Optional)</label>
                      <div style={styles.fileUploadContainer}>
                        <label 
                          style={styles.fileUploadButton}
                          onMouseEnter={(e) => Object.assign(e.target.style, styles.fileUploadButtonHover)}
                          onMouseLeave={(e) => Object.assign(e.target.style, styles.fileUploadButton)}
                        >
                          Browse Files
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            style={styles.hiddenInput}
                          />
                        </label>
                        <span style={styles.fileUploadText}>
                          {selectedFiles.length > 0 
                            ? `${selectedFiles.length} file(s) selected`
                            : 'No files selected'
                          }
                        </span>
                      </div>
                      <p style={styles.fileUploadHelp}>Upload images of the damage or issue (maximum 3 images, 5MB each)</p>
                    </div>
                  </div>
                </div>

                {/* Personal Information Section */}
                <div>
                  <h3 style={styles.sectionTitle}>3. Your Details</h3>
                  <div style={window.innerWidth >= 768 ? styles.inputGridMd : styles.inputGrid}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        style={styles.input}
                        onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                        onBlur={(e) => Object.assign(e.target.style, styles.input)}
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        style={styles.input}
                        onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                        onBlur={(e) => Object.assign(e.target.style, styles.input)}
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        style={styles.input}
                        onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                        onBlur={(e) => Object.assign(e.target.style, styles.input)}
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Address</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Your address for pickup/delivery service"
                        style={styles.input}
                        onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                        onBlur={(e) => Object.assign(e.target.style, styles.input)}
                      />
                    </div>
                  </div>
                </div>

                {/* Scheduling Section */}
                <div>
                  <h3 style={styles.sectionTitle}>4. Schedule Your Repair</h3>
                  <div style={window.innerWidth >= 768 ? styles.inputGridMd : styles.inputGrid}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Preferred Date *</label>
                      <input
                        type="date"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        style={styles.input}
                        onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                        onBlur={(e) => Object.assign(e.target.style, styles.input)}
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Preferred Time *</label>
                      <select
                        name="preferredTime"
                        value={formData.preferredTime}
                        onChange={handleInputChange}
                        required
                        style={styles.select}
                        onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                        onBlur={(e) => Object.assign(e.target.style, styles.select)}
                      >
                        <option value="">Select a time</option>
                        <option value="morning">Morning (8:00 - 12:00)</option>
                        <option value="afternoon">Afternoon (12:00 - 17:00)</option>
                        <option value="evening">Evening (17:00 - 20:00)</option>
                      </select>
                    </div>
                    <div style={{...styles.inputGroup, ...styles.inputGroupSpan2}}>
                      <label style={styles.label}>Service Type *</label>
                      <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleInputChange}
                        required
                        style={styles.select}
                        onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                        onBlur={(e) => Object.assign(e.target.style, styles.select)}
                      >
                        <option value="">Select service type</option>
                        <option value="in-store">In-Store Repair</option>
                        <option value="pickup">Pickup & Delivery</option>
                        <option value="diagnostic">Diagnostic Only</option>
                        <option value="express">Express Repair (Same Day)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div style={styles.termsContainer}>
                  <div style={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      name="termsCheck"
                      checked={formData.termsCheck}
                      onChange={handleInputChange}
                      required
                      style={styles.checkbox}
                    />
                    <label style={styles.termsText}>
                      I agree to the <a href="/" style={styles.link}>Terms & Conditions</a> and 
                      <a href="/" style={{...styles.link, marginLeft: '4px'}}>Privacy Policy</a> *
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div style={styles.submitContainer}>
                  <button
                    onClick={handleSubmit}
                    style={{
                      ...styles.submitButton,
                      ...(formData.termsCheck ? {} : styles.submitButtonDisabled),
                    }}
                    disabled={!formData.termsCheck}
                    onMouseEnter={(e) => {
                      if (formData.termsCheck) {
                        Object.assign(e.target.style, {...styles.submitButton, ...styles.submitButtonHover});
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formData.termsCheck) {
                        Object.assign(e.target.style, styles.submitButton);
                      }
                    }}
                  >
                    Book Repair Service
                  </button>
                  <p style={styles.submitHelp}>
                    We'll contact you within 24 hours to confirm your appointment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookRepair;