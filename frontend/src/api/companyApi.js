import apiClient from './authApi';

export const companyApi = {
  /**
   * Fetch registered tenant companies with pagination and filters
   * Calls GET /book/api/admin/companies
   */
  async getCompanies(params = {}) {
    try {
      const {
        page = 1,
        size = 10,
        search = '',
        status = 'ALL',
        sortBy = 'name',
        sortDir = 'asc',
      } = params;

      const response = await apiClient.get('/admin/companies', {
        params: {
          page,
          size,
          search: search ? search.trim() : undefined,
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
        error: error.response?.data?.message || 'Failed to load companies from server',
        data: [],
        totalElements: 0,
        totalPages: 0,
      };
    }
  },

  /**
   * Get single company details by ID
   * Calls GET /book/api/admin/companies/:id
   */
  async getCompanyById(id) {
    try {
      const response = await apiClient.get(`/admin/companies/${id}`);
      return {
        success: true,
        data: response.data?.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to retrieve company details',
      };
    }
  },

  /**
   * Suggest available company codes
   * Calls GET /book/api/admin/companies/suggest-code
   */
  async suggestCompanyCodes(name = '', baseCode = '') {
    try {
      const response = await apiClient.get('/admin/companies/suggest-code', {
        params: {
          name: name ? name.trim() : undefined,
          baseCode: baseCode ? baseCode.trim() : undefined,
        },
      });
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
   * Register a new tenant company
   * Calls POST /book/api/admin/companies
   */
  async createCompany(companyData) {
    try {
      const payload = {
        name: companyData.name,
        companyCode: companyData.companyCode,
        contactInformation: companyData.contactInformation,
        phone: companyData.phone || null,
        address: companyData.address || null,
        status: companyData.status || 'ACTIVE',
      };

      const response = await apiClient.post('/admin/companies', payload);
      return {
        success: true,
        data: response.data?.data,
      };
    } catch (error) {
      const details = error.response?.data?.details;
      const suggestedCodesStr = details?.suggestedCodes;
      const suggestedCodes = suggestedCodesStr
        ? suggestedCodesStr.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const errorMsg =
        error.response?.data?.message || 'Failed to register company on server';

      return {
        success: false,
        error: errorMsg,
        suggestedCodes,
      };
    }
  },

  /**
   * Update existing company details
   * Calls PUT /book/api/admin/companies/:id
   */
  async updateCompany(id, companyData) {
    try {
      const payload = {
        name: companyData.name,
        companyCode: companyData.companyCode,
        contactInformation: companyData.contactInformation,
        phone: companyData.phone || null,
        address: companyData.address || null,
        status: companyData.status || 'ACTIVE',
      };

      const response = await apiClient.put(`/admin/companies/${id}`, payload);
      return {
        success: true,
        data: response.data?.data,
      };
    } catch (error) {
      const errorMsg =
        error.response?.data?.details
          ? Object.values(error.response.data.details).join(', ')
          : error.response?.data?.message || 'Failed to update company details';

      return {
        success: false,
        error: errorMsg,
      };
    }
  },

  /**
   * Toggle company active/inactive status
   * Calls PATCH /book/api/admin/companies/:id/status
   */
  async toggleCompanyStatus(id) {
    try {
      const response = await apiClient.patch(`/admin/companies/${id}/status`);
      return {
        success: true,
        data: response.data?.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to toggle company status',
      };
    }
  },

  /**
   * Bulk update company active/inactive status
   * Calls PATCH /book/api/admin/companies/bulk/status
   */
  async bulkUpdateCompanyStatus(ids, status) {
    try {
      const response = await apiClient.patch('/admin/companies/bulk/status', {
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
        error: error.response?.data?.message || 'Failed to bulk update company statuses',
      };
    }
  },
};

export default companyApi;
