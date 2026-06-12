import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

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
    
    // Extract server message or default to standard offline error
    const message = error.response?.data?.error || 
                    error.response?.data?.message || 
                    error.message || 
                    'Connection failed. Ensure the backend server is running.';
    throw new Error(message);
  }
};

export default {
  analyzeProject
};
