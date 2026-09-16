import apiClient from './authApi';

export const adminApi = {
  /**
   * Fetch registered facility administrators with pagination and filters
   * Calls GET /book/api/admin/facility-admins
   */
  async getAdmins(params = {}) {
    try {
      const {
        page = 1,
        size = 10,
        search = '',
        companyFilter = 'ALL',
        status = 'ALL',
        sortBy = 'fullName',
        sortDir = 'asc',
      } = params;

      const response = await apiClient.get('/admin/facility-admins', {
        params: {
          page,
          size,
          search: search ? search.trim() : undefined,
          companyFilter: companyFilter && companyFilter !== 'ALL' ? companyFilter : undefined,
          status: status && status !== 'ALL' ? status : undefined,
          sortBy,
          sortDir,
        },
      });

      const pageData = response.data?.data;
      if (pageData && Array.isArray(pageData.content)) {
        return {
          success: true,
          data: pageData.content,
          page: pageData.page,
          size: pageData.size,
          totalElements: pageData.totalElements,
          totalPages: pageData.totalPages,
          last: pageData.last,
        };
      } else if (Array.isArray(pageData)) {
        return {
          success: true,
          data: pageData,
          totalElements: pageData.length,
          totalPages: 1,
        };
      }

      return {
        success: true,
        data: [],
        totalElements: 0,
        totalPages: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load administrators from server',
        data: [],
        totalElements: 0,
        totalPages: 0,
      };
    }
  },

  /**
   * Get single administrator details by ID
   * Calls GET /book/api/admin/facility-admins/:id
   */
  async getAdminById(id) {
    try {
      const response = await apiClient.get(`/admin/facility-admins/${id}`);
      return {
        success: true,
        data: response.data?.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to retrieve administrator details',
      };
    }
  },

  /**
   * Create a new facility administrator
   * Calls POST /book/api/admin/facility-admins
   */
  async createAdmin(adminData) {
    try {
      const payload = {
        fullName: adminData.fullName,
        email: adminData.email,
        password: adminData.password,
        companyId: Number(adminData.companyId),
        status: adminData.status || 'ACTIVE',
      };

      const response = await apiClient.post('/admin/facility-admins', payload);
      return {
        success: true,
        data: response.data?.data,
      };
    } catch (error) {
      const errorMsg =
        error.response?.data?.details
          ? Object.values(error.response.data.details).join(', ')
          : error.response?.data?.message || 'Failed to create administrator on server';

      return {
        success: false,
        error: errorMsg,
      };
    }
  },

  /**
   * Update existing facility administrator details
   * Calls PUT /book/api/admin/facility-admins/:id
   */
  async updateAdmin(id, adminData) {
    try {
      const payload = {
        fullName: adminData.fullName,
        email: adminData.email,
        password: adminData.password || undefined,
        companyId: Number(adminData.companyId),
        status: adminData.status || 'ACTIVE',
      };

      const response = await apiClient.put(`/admin/facility-admins/${id}`, payload);
      return {
        success: true,
        data: response.data?.data,
      };
    } catch (error) {
      const errorMsg =
        error.response?.data?.details
          ? Object.values(error.response.data.details).join(', ')
          : error.response?.data?.message || 'Failed to update administrator details';

      return {
        success: false,
        error: errorMsg,
      };
    }
  },

  /**
   * Toggle facility administrator active/inactive status
   * Calls PATCH /book/api/admin/facility-admins/:id/status
   */
  async toggleAdminStatus(id) {
    try {
      const response = await apiClient.patch(`/admin/facility-admins/${id}/status`);
      return {
        success: true,
        data: response.data?.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to toggle administrator status',
      };
    }
  },

  /**
   * Bulk update facility administrator active/inactive status
   * Calls PATCH /book/api/admin/facility-admins/bulk/status
   */
  async bulkUpdateAdminStatus(ids, status) {
    try {
      const response = await apiClient.patch('/admin/facility-admins/bulk/status', {
        ids: ids.map(Number),
        status,
      });
      return {
        success: true,
        data: response.data?.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to bulk update administrator statuses',
      };
    }
  },
};

export default adminApi;
