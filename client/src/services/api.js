import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically inject JWT token into requests if available in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Trigger Gemini AI failure analysis for a project idea
 * @param {string} idea - The user-provided project concept description
 * @returns {Promise<Object>} Structured prediction report containing risks, solutions, and score.
 */
export const analyzeProject = async (idea) => {
  try {
    const response = await apiClient.post('/api/project/analyze', { idea });
    return response.data;
  } catch (error) {
    console.error('Axios service request failed:', error);
    const message = error.response?.data?.error || 
                    error.response?.data?.message || 
                    error.message || 
                    'Connection failed. Ensure the backend server is running.';
    throw new Error(message);
  }
};

/**
 * Log in a user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} Login response with token and user details
 */
export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Login request failed:', error);
    let message = 'Invalid credentials or login failed.';
    if (error.response) {
      message = error.response.data?.error || message;
    } else if (error.request) {
      message = 'Connection failed. Ensure the backend server is running.';
    } else {
      message = error.message || message;
    }
    throw new Error(message);
  }
};

/**
 * Sign up a new user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} Signup response
 */
export const signupUser = async (email, password) => {
  try {
    const response = await apiClient.post('/api/auth/signup', { email, password });
    return response.data;
  } catch (error) {
    console.error('Signup request failed:', error);
    let message = 'Failed to create account.';
    if (error.response) {
      message = error.response.data?.error || message;
    } else if (error.request) {
      message = 'Connection failed. Ensure the backend server is running.';
    } else {
      message = error.message || message;
    }
    throw new Error(message);
  }
};

export default {
  analyzeProject,
  loginUser,
  signupUser
};

