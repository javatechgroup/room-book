import apiClient from './authApi';

export const auditApi = {
  /**
   * Fetch system audit logs with pagination, search, and category filters
   * Calls GET /book/api/admin/audit-logs
   */
  async getAuditLogs(params = {}) {
    try {
      const {
        page = 1,
        size = 10,
        search = '',
        action = 'ALL',
        entityType = 'ALL',
        companyId = undefined,
        sortBy = 'timestamp',
        sortDir = 'desc',
      } = params;

      const response = await apiClient.get('/admin/audit-logs', {
        params: {
          page,
          size,
          search: search ? search.trim() : undefined,
          action: action && action !== 'ALL' ? action : undefined,
          entityType: entityType && entityType !== 'ALL' ? entityType : undefined,
          companyId: companyId && companyId !== 'ALL' ? companyId : undefined,
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
        error: error.response?.data?.message || 'Failed to load system audit logs from server',
        data: [],
        totalElements: 0,
        totalPages: 0,
      };
    }
  },

  /**
   * Fetch distinct audit action types available for filtering
   * Calls GET /book/api/admin/audit-logs/actions
   */
  async getAuditActions() {
    try {
      const response = await apiClient.get('/admin/audit-logs/actions');
      return {
        success: true,
        data: response.data?.data || [],
      };
    } catch (error) {
      return {
        success: false,
        data: [],
      };
    }
  },

  /**
   * Fetch distinct entity types available for filtering
   * Calls GET /book/api/admin/audit-logs/entity-types
   */
  async getAuditEntityTypes() {
    try {
      const response = await apiClient.get('/admin/audit-logs/entity-types');
      return {
        success: true,
        data: response.data?.data || [],
      };
    } catch (error) {
      return {
        success: false,
        data: [],
      };
    }
  },
};

export default auditApi;
