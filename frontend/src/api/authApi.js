import axios from 'axios';

// Base API client configured with Vite proxy to backend context path
const API_BASE_URL = '/book/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 6000,
});

// Auto-attach JWT Bearer token to all outgoing requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('meetspace_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const authApi = {
  /**
   * Login user with email and password
   * Calls POST /book/api/auth/login
   */
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data && response.data.data) {
        return {
          success: true,
          data: response.data.data,
        };
      }
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      // Extract error message from backend ApiResponse
      const message =
        error.response?.data?.message ||
        error.response?.data?.details ||
        (error.response?.status === 401 ? 'Invalid email or password' : null) ||
        (error.code === 'ECONNABORTED' ? 'Connection timed out' : null) ||
        'Failed to connect to backend server. Please check your credentials.';

      return {
        success: false,
        error: message,
      };
    }
  },
};

export default apiClient;
