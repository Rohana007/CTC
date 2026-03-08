// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://api.ctctutor.com' // Replace with your production API URL
    : 'http://localhost:3001');

export const config = {
  apiBaseUrl: API_BASE_URL,
  environment: process.env.NODE_ENV || 'development',
  version: '1.0.0',
  
  // Feature flags
  features: {
    voiceInput: true,
    visionUpload: true,
    dictionary: true,
    viroAssistant: true,
    animatedAvatar: false, // Enable when D-ID is integrated
  },
  
  // Analytics
  analytics: {
    googleAnalyticsId: process.env.REACT_APP_GA_ID || '',
    sentryDsn: process.env.REACT_APP_SENTRY_DSN || '',
  },
  
  // Performance
  performance: {
    enableServiceWorker: process.env.NODE_ENV === 'production',
    enableCaching: true,
    cacheTimeout: 3600000, // 1 hour
  },
};

export default config;
