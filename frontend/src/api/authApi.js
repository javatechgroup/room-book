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
  if (token && !token.startsWith('demo_token_')) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.url !== '/auth/login') {
    // In offline demo session or without a backend JWT, abort call to prevent 403 Forbidden
    const controller = new AbortController();
    config.signal = controller.signal;
    controller.abort('DEMO_SESSION_BYPASS');
  }
  return config;
}, (error) => Promise.reject(error));

// Demo accounts for quick testing and fallback
export const DEMO_ACCOUNTS = [
  {
    role: 'SUPER_ADMIN',
    roleLabel: 'Super Admin',
    email: 'superadmin@system.com',
    password: 'password123',
    fullName: 'System Super Admin',
    companyId: null,
    icon: '👑',
    description: 'Manage companies, facility admins & system policies',
  },
  {
    role: 'COMPANY_ADMIN',
    roleLabel: 'Facility Admin',
    email: 'admin@acme.com',
    password: 'password123',
    fullName: 'Acme Administrator',
    companyId: 1,
    icon: '🏢',
    description: 'Manage physical rooms, floors & slot duration rules',
  },
  {
    role: 'EMPLOYEE',
    roleLabel: 'Employee',
    email: 'john.doe@acme.com',
    password: 'password123',
    fullName: 'John Doe',
    companyId: 1,
    icon: '👤',
    description: 'Check slot availability, book rooms & get smart recommendations',
  },
];

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
      // Check if this matches a predefined demo account for demo convenience
      const matchedDemo = DEMO_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
      );

      if (matchedDemo) {
        // Provide seamless demo login session if backend returns 401 or network error
        return {
          success: true,
          data: {
            accessToken: 'demo_token_' + btoa(matchedDemo.email) + '_' + Date.now(),
            tokenType: 'Bearer',
            userId: matchedDemo.role === 'SUPER_ADMIN' ? 1 : matchedDemo.role === 'COMPANY_ADMIN' ? 2 : 3,
            email: matchedDemo.email,
            fullName: matchedDemo.fullName,
            companyId: matchedDemo.companyId,
            role: matchedDemo.role,
            isDemoSession: true,
          },
        };
      }

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
