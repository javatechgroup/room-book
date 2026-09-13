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
    description: 'Manage companies, admins & system policies',
  },
  {
    role: 'COMPANY_ADMIN',
    roleLabel: 'Company Admin',
    email: 'admin@acme.com',
    password: 'password123',
    fullName: 'Acme Administrator',
    companyId: 1,
    icon: '🏢',
    description: 'Manage rooms, departments & company policies',
  },
  {
    role: 'EMPLOYEE',
    roleLabel: 'Employee',
    email: 'john.doe@acme.com',
    password: 'password123',
    fullName: 'John Doe',
    companyId: 1,
    icon: '👤',
    description: 'Search & book meeting rooms, invite colleagues',
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
