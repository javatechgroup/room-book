import apiClient from './authApi';
import {
  INITIAL_FACILITY_ROOMS,
  INITIAL_DEPARTMENTS,
  INITIAL_EMPLOYEES,
  INITIAL_BOOKINGS,
  INITIAL_FACILITY_SUMMARY,
  INITIAL_FACILITY_FLOORS,
} from '../components/FacilityAdminPortal/data/facilityAdminData';

// Helper: read the stored user session from localStorage
const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('meetspace_user') || 'null');
  } catch {
    return null;
  }
};

// Helper: check if session is running in offline / demo mode
const isDemoMode = () => {
  const token = localStorage.getItem('meetspace_token');
  if (!token || token.startsWith('demo_token_')) return true;
  const user = getStoredUser();
  if (user?.isDemoSession) return true;
  return false;
};

// Fallback in-memory state for offline/demo mode
let localRooms = [...INITIAL_FACILITY_ROOMS];
let localDepartments = [...INITIAL_DEPARTMENTS];
let localEmployees = [...INITIAL_EMPLOYEES];
let localBookings = [...INITIAL_BOOKINGS];
let localFloors = INITIAL_FACILITY_FLOORS.map((f) => ({ ...f }));


export const facilityApi = {
  // ════════════════════ ROOMS ════════════════════
  async getRooms(params = {}) {
    if (!isDemoMode()) {
      try {
        const response = await apiClient.get('/facility/rooms', { params });
        if (response.data && response.data.data) {
          return {
            success: true,
            data: response.data.data.content || [],
            totalElements: response.data.data.totalElements || 0,
            totalPages: response.data.data.totalPages || 1,
          };
        }
      } catch (e) {
        if (e.response?.status !== 403 && e.response?.status !== 401 && e.message !== 'DEMO_SESSION_BYPASS') {
          console.warn('Backend /facility/rooms unreachable, fallback to local store:', e.message);
        }
      }
    }
    // Fallback filter & search
    let list = [...localRooms];
    if (params.floor && params.floor !== 'ALL') {
      list = list.filter((r) => r.floor === params.floor);
    }
    if (params.status && params.status !== 'ALL') {
      list = list.filter((r) => r.status === params.status);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.location && r.location.toLowerCase().includes(q)) ||
          (r.description && r.description.toLowerCase().includes(q))
      );
    }
    return {
      success: true,
      data: list,
      totalElements: list.length,
      totalPages: 1,
    };
  },

  async getFloors() {
    if (!isDemoMode()) {
      try {
        const response = await apiClient.get('/facility/rooms/floors');
        if (response.data && response.data.data) {
          return { success: true, data: response.data.data };
        }
      } catch (e) {
        if (e.response?.status !== 403 && e.response?.status !== 401 && e.message !== 'DEMO_SESSION_BYPASS') {
          console.warn('Backend /facility/rooms/floors unreachable, fallback:', e.message);
        }
      }
    }
    const floors = Array.from(new Set(localRooms.map((r) => r.floor).filter(Boolean))).sort();
    return { success: true, data: floors.length > 0 ? floors : localFloors.map((f) => f.name) };
  },

  async createRoom(roomData) {
    try {
      const response = await apiClient.post('/facility/rooms', roomData);
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      console.warn('Create room API fallback:', errMsg);
    }
    const newRoom = {
      id: Date.now(),
      companyId: getStoredUser()?.companyId || null,
      name: roomData.name,
      floor: roomData.floor,
      location: roomData.location || '',
      capacity: Number(roomData.capacity) || 4,
      description: roomData.description || '',
      status: roomData.status || 'AVAILABLE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localRooms.unshift(newRoom);
    return { success: true, data: newRoom };
  },

  async updateRoom(id, roomData) {
    try {
      const response = await apiClient.put(`/facility/rooms/${id}`, roomData);
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      console.warn('Update room API fallback:', errMsg);
    }
    localRooms = localRooms.map((r) =>
      r.id === id ? { ...r, ...roomData, updatedAt: new Date().toISOString() } : r
    );
    const updated = localRooms.find((r) => r.id === id);
    return { success: true, data: updated };
  },

  async toggleRoomMaintenance(id) {
    try {
      const response = await apiClient.patch(`/facility/rooms/${id}/maintenance`);
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      console.warn('Toggle room maintenance fallback:', e.message);
    }
    localRooms = localRooms.map((r) => {
      if (r.id === id) {
        const nextStatus = r.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
        return { ...r, status: nextStatus, updatedAt: new Date().toISOString() };
      }
      return r;
    });
    const updated = localRooms.find((r) => r.id === id);
    return { success: true, data: updated };
  },

  async bulkUpdateRoomStatus(ids, status) {
    try {
      const response = await apiClient.patch('/facility/rooms/bulk/status', { ids, status });
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      console.warn('Bulk room status fallback:', e.message);
    }
    localRooms = localRooms.map((r) =>
      ids.includes(r.id) ? { ...r, status, updatedAt: new Date().toISOString() } : r
    );
    return { success: true, data: localRooms.filter((r) => ids.includes(r.id)) };
  },

  // ════════════════════ DEPARTMENTS ════════════════════
  async getDepartments(params = {}) {
    try {
      const response = await apiClient.get('/facility/departments', { params });
      if (response.data && response.data.data) {
        return {
          success: true,
          data: response.data.data.content || [],
          totalElements: response.data.data.totalElements || 0,
          totalPages: response.data.data.totalPages || 1,
        };
      }
    } catch (e) {
      console.warn('Backend /facility/departments unreachable, fallback:', e.message);
    }
    let list = localDepartments.map((d) => ({
      ...d,
      employeeCount: localEmployees.filter((e) => e.departmentId === d.id).length,
    }));
    if (params.status && params.status !== 'ALL') {
      list = list.filter((d) => d.status === params.status);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((d) => d.name.toLowerCase().includes(q));
    }
    return {
      success: true,
      data: list,
      totalElements: list.length,
      totalPages: 1,
    };
  },

  async getAllDepartments() {
    try {
      const response = await apiClient.get('/facility/departments/all');
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      console.warn('Backend /facility/departments/all fallback:', e.message);
    }
    return { success: true, data: localDepartments };
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
    const newDept = {
      id: Date.now(),
      companyId: getStoredUser()?.companyId || null,
      name: deptData.name,
      status: deptData.status || 'ACTIVE',
      employeeCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localDepartments.push(newDept);
    return { success: true, data: newDept };
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
    localDepartments = localDepartments.map((d) =>
      d.id === id ? { ...d, ...deptData, updatedAt: new Date().toISOString() } : d
    );
    const updated = localDepartments.find((d) => d.id === id);
    return { success: true, data: updated };
  },

  async toggleDepartmentStatus(id) {
    try {
      const response = await apiClient.patch(`/facility/departments/${id}/status`);
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      console.warn('Toggle department status fallback:', e.message);
    }
    localDepartments = localDepartments.map((d) => {
      if (d.id === id) {
        const nextStatus = d.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return { ...d, status: nextStatus, updatedAt: new Date().toISOString() };
      }
      return d;
    });
    const updated = localDepartments.find((d) => d.id === id);
    return { success: true, data: updated };
  },

  // ════════════════════ EMPLOYEES ════════════════════
  async getEmployees(params = {}) {
    try {
      const response = await apiClient.get('/facility/employees', { params });
      if (response.data && response.data.data) {
        return {
          success: true,
          data: response.data.data.content || [],
          totalElements: response.data.data.totalElements || 0,
          totalPages: response.data.data.totalPages || 1,
        };
      }
    } catch (e) {
      console.warn('Backend /facility/employees unreachable, fallback:', e.message);
    }
    let list = [...localEmployees];
    if (params.departmentId) {
      list = list.filter((e) => String(e.departmentId) === String(params.departmentId));
    }
    if (params.status && params.status !== 'ALL') {
      list = list.filter((e) => e.status === params.status);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          (e.departmentName && e.departmentName.toLowerCase().includes(q))
      );
    }
    return {
      success: true,
      data: list,
      totalElements: list.length,
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
    const dept = localDepartments.find((d) => d.id === Number(empData.departmentId));
    const newEmp = {
      id: Date.now(),
      companyId: getStoredUser()?.companyId || null,
      departmentId: Number(empData.departmentId),
      departmentName: dept ? dept.name : '',
      fullName: empData.fullName,
      email: empData.email,
      role: empData.role || 'EMPLOYEE',
      status: empData.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localEmployees.unshift(newEmp);
    // update dept count
    if (dept) dept.employeeCount = (dept.employeeCount || 0) + 1;
    return { success: true, data: newEmp };
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
    const dept = localDepartments.find((d) => d.id === Number(empData.departmentId));
    localEmployees = localEmployees.map((e) =>
      e.id === id
        ? {
            ...e,
            ...empData,
            departmentName: dept ? dept.name : e.departmentName,
            updatedAt: new Date().toISOString(),
          }
        : e
    );
    const updated = localEmployees.find((e) => e.id === id);
    return { success: true, data: updated };
  },

  async toggleEmployeeStatus(id) {
    try {
      const response = await apiClient.patch(`/facility/employees/${id}/status`);
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      console.warn('Toggle employee status fallback:', e.message);
    }
    localEmployees = localEmployees.map((e) => {
      if (e.id === id) {
        const nextStatus = e.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return { ...e, status: nextStatus, updatedAt: new Date().toISOString() };
      }
      return e;
    });
    const updated = localEmployees.find((e) => e.id === id);
    return { success: true, data: updated };
  },

  async bulkUpdateEmployeeStatus(ids, status) {
    try {
      const response = await apiClient.patch('/facility/employees/bulk/status', { ids, status });
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      console.warn('Bulk employee status fallback:', e.message);
    }
    localEmployees = localEmployees.map((e) =>
      ids.includes(e.id) ? { ...e, status, updatedAt: new Date().toISOString() } : e
    );
    return { success: true, data: localEmployees.filter((e) => ids.includes(e.id)) };
  },

  // ════════════════════ BOOKINGS ════════════════════
  async getBookings(params = {}) {
    try {
      const response = await apiClient.get('/facility/bookings', { params });
      if (response.data && response.data.data) {
        return {
          success: true,
          data: response.data.data.content || [],
          totalElements: response.data.data.totalElements || 0,
          totalPages: response.data.data.totalPages || 1,
        };
      }
    } catch (e) {
      console.warn('Backend /facility/bookings unreachable, fallback:', e.message);
    }
    let list = [...localBookings];
    const now = new Date();
    if (params.floor && params.floor !== 'ALL') {
      list = list.filter((b) => b.floor === params.floor);
    }
    if (params.status && params.status !== 'ALL') {
      list = list.filter((b) => {
        if (params.status === 'CANCELLED') return b.status === 'CANCELLED';
        if (b.status === 'CANCELLED') return false;
        const s = new Date(b.startTime);
        const e = new Date(b.endTime);
        if (params.status === 'IN_PROGRESS') return now >= s && now <= e;
        if (params.status === 'CONFIRMED' || params.status === 'UPCOMING') return s > now;
        if (params.status === 'COMPLETED') return e < now;
        return b.status === params.status;
      });
    }
    if (params.roomId) {
      list = list.filter((b) => String(b.roomId) === String(params.roomId));
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.roomName.toLowerCase().includes(q) ||
          b.bookerName.toLowerCase().includes(q)
      );
    }
    return {
      success: true,
      data: list,
      totalElements: list.length,
      totalPages: 1,
    };
  },

  async getMyBookings() {
    if (!isDemoMode()) {
      try {
        const response = await apiClient.get('/facility/bookings/my-bookings');
        if (response.data && response.data.data) {
          return { success: true, data: response.data.data };
        }
      } catch (e) {
        if (e.response?.status !== 403 && e.response?.status !== 401 && e.message !== 'DEMO_SESSION_BYPASS') {
          console.warn('Backend /facility/bookings/my-bookings fallback:', e.message);
        }
      }
    }
    const user = getStoredUser();
    const email = user?.email || '';
    return { success: true, data: email ? localBookings.filter((b) => b.bookerEmail === email) : [] };
  },

  async getOccupancyForDay(dateStr) {
    if (!isDemoMode()) {
      try {
        const response = await apiClient.get('/facility/bookings/occupancy', { params: { date: dateStr } });
        if (response.data && response.data.data) {
          return { success: true, data: response.data.data };
        }
      } catch (e) {
        if (e.response?.status !== 403 && e.response?.status !== 401 && e.message !== 'DEMO_SESSION_BYPASS') {
          console.warn('Backend /facility/bookings/occupancy fallback:', e.message);
        }
      }
    }
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    return {
      success: true,
      data: localBookings.filter((b) => b.startTime.startsWith(targetDate) && b.status !== 'CANCELLED'),
    };
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
    if (new Date(bookingData.startTime) < new Date()) {
      return { success: false, error: 'Cannot book a room in the past. Please select a future date and time.' };
    }

    const room = localRooms.find((r) => r.id === Number(bookingData.roomId));
    const user = getStoredUser();
    const newBooking = {
      id: Date.now(),
      companyId: user?.companyId || null,
      roomId: Number(bookingData.roomId),
      roomName: room ? room.name : 'Meeting Room',
      floor: room ? room.floor : '',
      location: room ? room.location : '',
      bookerId: user?.id || null,
      bookerName: user?.fullName || user?.name || '',
      bookerEmail: user?.email || '',
      departmentName: bookingData.department || '',
      title: bookingData.title,
      description: bookingData.description || '',
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      status: 'CONFIRMED',
      attendeesCount: Number(bookingData.attendeesCount) || 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localBookings.unshift(newBooking);
    return { success: true, data: newBooking };
  },

  async cancelBooking(bookingId) {
    try {
      const response = await apiClient.patch(`/facility/bookings/${bookingId}/cancel`);
      if (response.data && response.data.data) {
        return { success: true, data: response.data.data };
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || e.message;
      console.warn('Cancel booking fallback:', errMsg);
    }
    localBookings = localBookings.map((b) =>
      b.id === bookingId ? { ...b, status: 'CANCELLED', updatedAt: new Date().toISOString() } : b
    );
    const updated = localBookings.find((b) => b.id === bookingId);
    return { success: true, data: updated };
  },

  // ════════════════════ DASHBOARD & DIRECTORY ════════════════════
  async getFacilitySummary() {
    if (!isDemoMode()) {
      try {
        const response = await apiClient.get('/facility/summary');
        if (response.data && response.data.data) {
          return { success: true, data: response.data.data };
        }
      } catch (e) {
        if (e.response?.status !== 403 && e.response?.status !== 401 && e.message !== 'DEMO_SESSION_BYPASS') {
          console.warn('Backend /facility/summary fallback:', e.message);
        }
      }
    }
    const now = new Date();
    const totalRooms = localRooms.length;
    const maintenanceRooms = localRooms.filter((r) => r.status === 'MAINTENANCE').length;
    const occupiedRoomsNow = localBookings.filter((b) => {
      if (b.status === 'CANCELLED') return false;
      const s = new Date(b.startTime);
      const e = new Date(b.endTime);
      return now >= s && now <= e;
    }).length;
    const upcomingBookingsCount = localBookings.filter((b) => {
      if (b.status === 'CANCELLED') return false;
      return new Date(b.startTime) > now;
    }).length;
    const todayBookingsCount = localBookings.filter((b) => b.status !== 'CANCELLED').length;

    const floorDist = {};
    localRooms.forEach((r) => {
      floorDist[r.floor] = (floorDist[r.floor] || 0) + 1;
    });

    const deptHeadcount = {};
    localDepartments.forEach((d) => {
      deptHeadcount[d.name] = localEmployees.filter((e) => e.departmentId === d.id).length;
    });

    return {
      success: true,
      data: {
        totalRooms,
        availableRooms: Math.max(0, totalRooms - maintenanceRooms - occupiedRoomsNow),
        maintenanceRooms,
        occupiedRoomsNow,
        totalDepartments: localDepartments.length,
        totalEmployees: localEmployees.length,
        todayBookingsCount,
        upcomingBookingsCount,
        floorDistribution: floorDist,
        departmentHeadcount: deptHeadcount,
      },
    };
  },

  async getCompanyDirectory() {
    if (!isDemoMode()) {
      try {
        const response = await apiClient.get('/facility/directory');
        if (response.data && response.data.data) {
          return { success: true, data: response.data.data };
        }
      } catch (e) {
        if (e.response?.status !== 403 && e.response?.status !== 401 && e.message !== 'DEMO_SESSION_BYPASS') {
          console.warn('Backend /facility/directory fallback:', e.message);
        }
      }
    }
    const grouped = {};
    localDepartments.forEach((d) => {
      grouped[d.name] = localEmployees.filter((e) => e.departmentId === d.id);
    });

    return {
      success: true,
      data: {
        totalEmployees: localEmployees.length,
        totalDepartments: localDepartments.length,
        totalRooms: localRooms.length,
        employees: localEmployees,
        departmentGroups: grouped,
      },
    };
  },

  // ════════════════════ FLOORS ════════════════════
  async getFloorsList(params = {}) {
    if (!isDemoMode()) {
      try {
        const response = await apiClient.get('/facility/floors', { params });
        if (response.data && response.data.data) {
          return {
            success: true,
            data: response.data.data.content || [],
            totalElements: response.data.data.totalElements || 0,
            totalPages: response.data.data.totalPages || 1,
          };
        }
      } catch (e) {
        if (e.response?.status !== 403 && e.response?.status !== 401 && e.message !== 'DEMO_SESSION_BYPASS') {
          console.warn('Backend /facility/floors unreachable, fallback to local store:', e.message);
        }
      }
    }
    let list = [...localFloors];
    if (params.status && params.status !== 'ALL') {
      list = list.filter((f) => f.status === params.status);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.description && f.description.toLowerCase().includes(q))
      );
    }
    return {
      success: true,
      data: list,
      totalElements: list.length,
      totalPages: 1,
    };
  },

  async getAllFloors(companyId) {
    if (!isDemoMode()) {
      try {
        const response = await apiClient.get('/facility/floors/all', {
          params: companyId ? { companyId } : undefined,
        });
        if (response.data && response.data.data) {
          return { success: true, data: response.data.data };
        }
      } catch (e) {
        if (e.response?.status !== 403 && e.response?.status !== 401 && e.message !== 'DEMO_SESSION_BYPASS') {
          console.warn('Backend /facility/floors/all fallback:', e.message);
        }
      }
    }
    return { success: true, data: localFloors.filter((f) => f.status === 'ACTIVE') };
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
      console.warn(`Backend /facility/floors/${id} fallback:`, e.message);
    }
    const floor = localFloors.find((f) => f.id === Number(id));
    return { success: Boolean(floor), data: floor };
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
    const newFloor = {
      id: Date.now(),
      companyId: companyId || getStoredUser()?.companyId || null,
      name: floorData.name,
      floorNumber: floorData.floorNumber != null ? Number(floorData.floorNumber) : 0,
      description: floorData.description || '',
      status: floorData.status || 'ACTIVE',
      roomCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localFloors.push(newFloor);
    return { success: true, data: newFloor };
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
    const idx = localFloors.findIndex((f) => f.id === Number(id));
    if (idx !== -1) {
      localFloors[idx] = {
        ...localFloors[idx],
        ...floorData,
        updatedAt: new Date().toISOString(),
      };
      return { success: true, data: localFloors[idx] };
    }
    return { success: false, error: 'Floor not found' };
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
    const floor = localFloors.find((f) => f.id === Number(id));
    if (floor) {
      floor.status = floor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      return { success: true, data: floor };
    }
    return { success: false, error: 'Floor not found' };
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
    localFloors = localFloors.filter((f) => f.id !== Number(id));
    return { success: true };
  },
};
