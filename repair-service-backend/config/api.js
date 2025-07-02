// config/api.js
// Centralized API configuration for your React app

const API_CONFIG = {
  // Try multiple possible backend URLs
  POSSIBLE_URLS: [
    'http://localhost:5000/api',  // Primary backend port
    'http://localhost:3000/api',  // Alternative port
    process.env.REACT_APP_API_URL // Environment variable override
  ].filter(Boolean), // Remove any undefined values

  // Get the base URL (you can enhance this with health checks)
  getBaseUrl: () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  },

  // Health check function to test which server is running
  findActiveServer: async () => {
    for (const url of API_CONFIG.POSSIBLE_URLS) {
      try {
        const response = await fetch(`${url.replace('/api', '')}/health`, {
          method: 'GET',
          timeout: 3000
        });
        if (response.ok) {
          console.log(`Active server found at: ${url}`);
          return url;
        }
      } catch (error) {
        console.log(`Server not responding at: ${url}`);
        continue;
      }
    }
    
    // Default fallback
    console.warn('No active server found, using default:', API_CONFIG.POSSIBLE_URLS[0]);
    return API_CONFIG.POSSIBLE_URLS[0];
  }
};

export default API_CONFIG;