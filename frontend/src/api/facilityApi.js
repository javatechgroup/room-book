import apiClient from './authApi';


export const facilityApi = {
  // ════════════════════ ROOMS ════════════════════
  async getRooms(params = {}) {
    try {
      const response = await apiClient.get('/facility/rooms', { params });
      if (response.data && response.data.data) {
        return {
          success: true,
          data: response.data.data.content || response.data.data || [],
          totalElements: response.data.data.totalElements || 0,
          totalPages: response.data.data.totalPages || 1,
        };
      }
    } catch (e) {
      console.warn('Backend /facility/rooms request failed:', e.message);
    }
    return {
      success: true,
      data: [],
      totalElements: 0,
      totalPages: 1,
    };
  },

  async getFloors(params = {}) {
    try {
      const response = await apiClient.get('/facility/rooms/floors', { params });
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      console.warn('Backend /facility/rooms/floors request failed:', e.message);
    }
    return { success: true, data: [] };
  },

  async createRoom(roomData) {
    try {
      const response = await apiClient.post('/facility/rooms', roomData);
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      return { success: false, error: errMsg };
    }
    return { success: false, error: 'Failed to create room on server' };
  },

  async updateRoom(id, roomData) {
    try {
      const response = await apiClient.put(`/facility/rooms/${id}`, roomData);
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      return { success: false, error: errMsg };
    }
    return { success: false, error: 'Failed to update room on server' };
  },

  async toggleRoomMaintenance(id) {
    try {
      const response = await apiClient.patch(`/facility/rooms/${id}/maintenance`);
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      return { success: false, error: errMsg };
    }
    return { success: false, error: 'Failed to toggle room status' };
  },

  async bulkUpdateRoomStatus(ids, status) {
    try {
      const response = await apiClient.patch('/facility/rooms/bulk/status', { ids, status });
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      return { success: false, error: errMsg };
    }
    return { success: false, error: 'Failed to bulk update rooms' };
  },

  // ════════════════════ DEPARTMENTS ════════════════════
  async getDepartments(params = {}) {
    try {
      const response = await apiClient.get('/facility/departments', { params });
      if (response.data && response.data.data) {
        return {
          success: true,
          data: response.data.data.content || response.data.data || [],
          totalElements: response.data.data.totalElements || 0,
          totalPages: response.data.data.totalPages || 1,
        };
      }
    } catch (e) {
      console.warn('Backend /facility/departments request failed:', e.message);
    }
    return {
      success: true,
      data: [],
      totalElements: 0,
      totalPages: 1,
    };
  },

  async getAllDepartments(params = {}) {
    try {
      const response = await apiClient.get('/facility/departments/all', { params });
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      console.warn('Backend /facility/departments/all request failed:', e.message);
    }
    return { success: true, data: [] };
  },

  async createDepartment(deptData) {
    try {
      const response = await apiClient.post('/facility/departments', deptData);
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      return { success: false, error: errMsg };
    }
    return { success: false, error: 'Failed to create department' };
  },

  async updateDepartment(id, deptData) {
    try {
      const response = await apiClient.put(`/facility/departments/${id}`, deptData);
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      return { success: false, error: errMsg };
    }
    return { success: false, error: 'Failed to update department' };
  },

  async toggleDepartmentStatus(id) {
    try {
      const response = await apiClient.patch(`/facility/departments/${id}/status`);
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      return { success: false, error: errMsg };
    }
    return { success: false, error: 'Failed to toggle department status' };
  },

  // ════════════════════ EMPLOYEES ════════════════════
  async getEmployees(params = {}) {
    try {
      const response = await apiClient.get('/facility/employees', { params });
      if (response.data && response.data.data) {
        return {
          success: true,
          data: response.data.data.content || response.data.data || [],
          totalElements: response.data.data.totalElements || 0,
          totalPages: response.data.data.totalPages || 1,
        };
      }
    } catch (e) {
      console.warn('Backend /facility/employees request failed:', e.message);
    }
    return {
      success: true,
      data: [],
      totalElements: 0,
      totalPages: 1,
    };
  },

  async createEmployee(empData) {
    try {
      const response = await apiClient.post('/facility/employees', empData);
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      return { success: false, error: errMsg };
    }
    return { success: false, error: 'Failed to create employee' };
  },

  async updateEmployee(id, empData) {
    try {
      const response = await apiClient.put(`/facility/employees/${id}`, empData);
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      return { success: false, error: errMsg };
    }
    return { success: false, error: 'Failed to update employee' };
  },

  async toggleEmployeeStatus(id) {
    try {
      const response = await apiClient.patch(`/facility/employees/${id}/status`);
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      return { success: false, error: errMsg };
    }
    return { success: false, error: 'Failed to toggle employee status' };
  },

  async bulkUpdateEmployeeStatus(ids, status) {
    try {
      const response = await apiClient.patch('/facility/employees/bulk/status', { ids, status });
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      return { success: false, error: errMsg };
    }
    return { success: false, error: 'Failed to bulk update employees' };
  },

  // ════════════════════ BOOKINGS ════════════════════
  async getBookings(params = {}) {
    try {
      const response = await apiClient.get('/facility/bookings', { params });
      if (response.data && response.data.data) {
        return {
          success: true,
          data: response.data.data.content || response.data.data || [],
          totalElements: response.data.data.totalElements || 0,
          totalPages: response.data.data.totalPages || 1,
        };
      }
    } catch (e) {
      console.warn('Backend /facility/bookings request failed:', e.message);
    }
    return {
      success: true,
      data: [],
      totalElements: 0,
      totalPages: 1,
    };
  },

  async getMyBookings(params = {}) {
    try {
      const response = await apiClient.get('/facility/bookings/my-bookings', { params });
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      console.warn('Backend /facility/bookings/my-bookings failed:', e.message);
    }
    return { success: true, data: [] };
  },

  async getOccupancyForDay(dateStr, params = {}) {
    try {
      const response = await apiClient.get('/facility/bookings/occupancy', { params: { date: dateStr, ...params } });
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      console.warn('Backend /facility/bookings/occupancy failed:', e.message);
    }
    return { success: true, data: [] };
  },

  async createBooking(bookingData) {
    try {
      const response = await apiClient.post('/facility/bookings', bookingData);
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      return { success: false, error: errMsg };
    }
    return { success: false, error: 'Failed to create booking' };
  },

  async updateBooking(bookingId, bookingData) {
    try {
      const response = await apiClient.put(`/facility/bookings/${bookingId}`, bookingData);
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      return { success: false, error: errMsg };
    }
    return { success: false, error: 'Failed to update booking' };
  },

  async cancelBooking(bookingId, cancelSeries = false) {
    try {
      const response = await apiClient.patch(`/facility/bookings/${bookingId}/cancel`, null, {
        params: { cancelSeries },
      });
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      return { success: false, error: errMsg };
    }
    return { success: false, error: 'Failed to cancel booking' };
  },

  // ════════════════════ DASHBOARD & DIRECTORY ════════════════════
  async getFacilitySummary(params = {}) {
    try {
      const response = await apiClient.get('/facility/summary', { params });
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      console.warn('Backend /facility/summary failed:', e.message);
    }
    return {
      success: true,
      data: {
        totalRooms: 0,
        availableRooms: 0,
        maintenanceRooms: 0,
        occupiedRoomsNow: 0,
        totalFloors: 0,
        totalDepartments: 0,
        totalEmployees: 0,
        todayBookingsCount: 0,
        upcomingBookingsCount: 0,
        floorDistribution: {},
        departmentHeadcount: {},
      },
    };
  },

  async getCompanyDirectory(params = {}) {
    try {
      const response = await apiClient.get('/facility/directory', { params });
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      console.warn('Backend /facility/directory failed:', e.message);
    }
    return {
      success: true,
      data: {
        totalEmployees: 0,
        totalDepartments: 0,
        totalRooms: 0,
        employees: [],
        departmentGroups: {},
      },
    };
  },

  async searchEmployees(query = '', params = {}) {
    try {
      const response = await apiClient.get('/facility/employees/search', { params: { query, ...params } });
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      console.warn('Backend /facility/employees/search failed:', e.message);
    }
    return { success: true, data: [] };
  },

  // ════════════════════ FLOORS ════════════════════
  async getFloorsList(params = {}) {
    try {
      const response = await apiClient.get('/facility/floors', { params });
      if (response.data && response.data.data) {
        return {
          success: true,
          data: response.data.data.content || response.data.data || [],
          totalElements: response.data.data.totalElements || 0,
          totalPages: response.data.data.totalPages || 1,
        };
      }
    } catch (e) {
      console.warn('Backend /facility/floors request failed:', e.message);
    }
    return {
      success: true,
      data: [],
      totalElements: 0,
      totalPages: 1,
    };
  },

  async getAllFloors(companyId) {
    try {
      const response = await apiClient.get('/facility/floors/all', {
        params: companyId ? { companyId } : undefined,
      });
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      console.warn('Backend /facility/floors/all request failed:', e.message);
    }
    return { success: true, data: [] };
  },

  async getFloorById(id, companyId) {
    try {
      const response = await apiClient.get(`/facility/floors/${id}`, {
        params: companyId ? { companyId } : undefined,
      });
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      return { success: false, error: errMsg };
    }
    return { success: false, error: 'Floor not found' };
  },

  async createFloor(floorData, companyId) {
    try {
      const payload = { ...floorData };
      if (companyId) payload.companyId = companyId;
      const response = await apiClient.post('/facility/floors', payload);
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      return { success: false, error: errMsg };
    }
    return { success: false, error: 'Failed to create floor' };
  },

  async updateFloor(id, floorData, companyId) {
    try {
      const payload = { ...floorData };
      if (companyId) payload.companyId = companyId;
      const response = await apiClient.put(`/facility/floors/${id}`, payload);
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      return { success: false, error: errMsg };
    }
    return { success: false, error: 'Failed to update floor' };
  },

  async toggleFloorStatus(id, companyId) {
    try {
      const response = await apiClient.patch(`/facility/floors/${id}/status`, null, {
        params: companyId ? { companyId } : undefined,
      });
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      return { success: false, error: errMsg };
    }
    return { success: false, error: 'Failed to toggle floor status' };
  },

  async deleteFloor(id, companyId) {
    try {
      const response = await apiClient.delete(`/facility/floors/${id}`, {
        params: companyId ? { companyId } : undefined,
      });
      if (response.data) {
        return { success: true };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      return { success: false, error: errMsg };
    }
    return { success: false, error: 'Failed to delete floor' };
  },

  // ════════════════════ BOOKING POLICIES ════════════════════
  async getBookingPolicy(params = {}) {
    try {
      const response = await apiClient.get('/facility/policy', { params });
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      console.warn('Backend /facility/policy request failed:', e.message);
      return { success: false, error: e.response?.data?.message || e.message };
    }
    return {
      success: true,
      data: {
        maxAdvanceBookingDays: 30,
        minBookingDurationMinutes: 30,
        maxBookingDurationHours: 4,
        cancellationCutoffMinutes: 30,
      },
    };
  },

  async updateBookingPolicy(policyData, params = {}) {
    try {
      const response = await apiClient.put('/facility/policy', policyData, { params });
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return { success: true, data: response.data };
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      return { success: false, error: errMsg };
    }
  },
};
