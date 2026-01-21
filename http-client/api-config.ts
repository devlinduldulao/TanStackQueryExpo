import axios from 'axios';
import { Platform } from 'react-native';

// Determine base URL based on platform
const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

// Create axios instance with configuration
export const api = axios.create({
  baseURL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // You could add authentication tokens here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      console.error(`API Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      // Request was made but no response
      console.error('API No Response:', error.request);
    } else {
      // Something else happened
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);
