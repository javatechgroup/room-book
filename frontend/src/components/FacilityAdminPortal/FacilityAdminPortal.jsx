import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { facilityApi } from '../../api/facilityApi';
import {
  INITIAL_FACILITY_ROOMS,
  INITIAL_DEPARTMENTS,
  INITIAL_EMPLOYEES,
  INITIAL_BOOKINGS,
  INITIAL_FACILITY_SUMMARY,
} from './data/facilityAdminData';
import FacilityAdminMetrics from './components/FacilityAdminMetrics';
import FacilityAdminTabs from './components/FacilityAdminTabs';
import RoomsTab from './components/RoomsTab';
import RoomModal from './components/RoomModal';
import RoomInspectorDrawer from './components/RoomInspectorDrawer';
import DepartmentsTab from './components/DepartmentsTab';
import DepartmentModal from './components/DepartmentModal';
import EmployeesTab from './components/EmployeesTab';
import EmployeeModal from './components/EmployeeModal';
import EmployeeInspectorDrawer from './components/EmployeeInspectorDrawer';
import BookRoomTab from './components/BookRoomTab';
import BookingMonitorTab from './components/BookingMonitorTab';
import BookingInspectorDrawer from './components/BookingInspectorDrawer';
import CompanyDirectoryTab from './components/CompanyDirectoryTab';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import './FacilityAdminPortal.css';

export default function FacilityAdminPortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' | 'departments' | 'employees' | 'book-room' | 'monitor' | 'directory'

  // Summary Metrics State
  const [summary, setSummary] = useState(INITIAL_FACILITY_SUMMARY);

  // ════════════════════ PRIMARY DATA STATES ════════════════════
  const [rooms, setRooms] = useState(INITIAL_FACILITY_ROOMS);
  const [floors, setFloors] = useState(['Ground Floor', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4']);
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [myBookings, setMyBookings] = useState([]);
  const [directoryData, setDirectoryData] = useState({});

  // ════════════════════ TAB SPECIFIC FILTERS ════════════════════
  // 1. Rooms Tab
  const [roomSearch, setRoomSearch] = useState('');
  const [roomFloorFilter, setRoomFloorFilter] = useState('ALL');
  const [roomStatusFilter, setRoomStatusFilter] = useState('ALL');
  const [roomSort, setRoomSort] = useState({ field: 'name', direction: 'asc' });
  const [roomPage, setRoomPage] = useState(1);
  const [roomPageSize, setRoomPageSize] = useState(10);
  const [totalRoomsCount, setTotalRoomsCount] = useState(0);
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);

  // 2. Departments Tab
  const [deptSearch, setDeptSearch] = useState('');
  const [deptStatusFilter, setDeptStatusFilter] = useState('ALL');
  const [deptSort, setDeptSort] = useState({ field: 'name', direction: 'asc' });
  const [deptPage, setDeptPage] = useState(1);
  const [deptPageSize, setDeptPageSize] = useState(10);
  const [totalDeptsCount, setTotalDeptsCount] = useState(0);

  // 3. Employees Tab
  const [empSearch, setEmpSearch] = useState('');
  const [empDeptFilter, setEmpDeptFilter] = useState('ALL');
  const [empStatusFilter, setEmpStatusFilter] = useState('ALL');
  const [empRoleFilter, setEmpRoleFilter] = useState('ALL');
  const [empSort, setEmpSort] = useState({ field: 'fullName', direction: 'asc' });
  const [empPage, setEmpPage] = useState(1);
  const [empPageSize, setEmpPageSize] = useState(10);
  const [totalEmpsCount, setTotalEmpsCount] = useState(0);
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);

  // 4. Booking Monitor Tab
  const [monitorSearch, setMonitorSearch] = useState('');
  const [monitorFloorFilter, setMonitorFloorFilter] = useState('ALL');
  const [monitorStatusFilter, setMonitorStatusFilter] = useState('ALL');
  const [monitorDate, setMonitorDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [monitorPage, setMonitorPage] = useState(1);
  const [monitorPageSize, setMonitorPageSize] = useState(10);
  const [totalBookingsCount, setTotalBookingsCount] = useState(0);

  // ════════════════════ DRAWERS & MODALS ════════════════════
  const [drawerRoom, setDrawerRoom] = useState(null);
  const [drawerEmployee, setDrawerEmployee] = useState(null);
  const [drawerBooking, setDrawerBooking] = useState(null);

  // Room Modal
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    name: '',
    floor: 'Floor 1',
    location: '',
    capacity: 6,
    description: '',
    status: 'AVAILABLE',
  });

  // Department Modal
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({
    name: '',
    status: 'ACTIVE',
  });
  const [deptModalError, setDeptModalError] = useState('');

  // Employee Modal
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [empForm, setEmpForm] = useState({
    fullName: '',
    email: '',
    departmentId: 1,
    role: 'EMPLOYEE',
    password: '',
    status: 'ACTIVE',
  });
  const [empModalError, setEmpModalError] = useState('');

  const showToast = (title, message, type = 'success') => {
    if (type === 'error') toast.error(title, message);
    else if (type === 'warning') toast.warning(title, message);
    else if (type === 'info') toast.info(title, message);
    else toast.success(title, message);
  };

  // ════════════════════ DATA FETCHERS ════════════════════
  const fetchSummary = useCallback(async () => {
    const res = await facilityApi.getFacilitySummary();
    if (res.success && res.data) {
      setSummary(res.data);
    }
  }, []);

  const fetchRooms = useCallback(async (overrides = {}) => {
    const page = overrides.page !== undefined ? overrides.page : roomPage;
    const size = overrides.size !== undefined ? overrides.size : roomPageSize;
    const search = overrides.search !== undefined ? overrides.search : roomSearch;
    const floor = overrides.floor !== undefined ? overrides.floor : roomFloorFilter;
    const status = overrides.status !== undefined ? overrides.status : roomStatusFilter;
    const sortBy = overrides.sortBy !== undefined ? overrides.sortBy : roomSort.field;
    const sortDir = overrides.sortDir !== undefined ? overrides.sortDir : roomSort.direction;

    const res = await facilityApi.getRooms({ page, size, search, floor, status, sortBy, sortDir });
    if (res.success && Array.isArray(res.data)) {
      setRooms(res.data);
      if (typeof res.totalElements === 'number') setTotalRoomsCount(res.totalElements);
    }
  }, [roomPage, roomPageSize, roomSearch, roomFloorFilter, roomStatusFilter, roomSort]);

  const fetchFloors = useCallback(async () => {
    const res = await facilityApi.getFloors();
    if (res.success && Array.isArray(res.data)) {
      setFloors(res.data);
    }
  }, []);

  const fetchDepartments = useCallback(async (overrides = {}) => {
    const page = overrides.page !== undefined ? overrides.page : deptPage;
    const size = overrides.size !== undefined ? overrides.size : deptPageSize;
    const search = overrides.search !== undefined ? overrides.search : deptSearch;
    const status = overrides.status !== undefined ? overrides.status : deptStatusFilter;
    const sortBy = overrides.sortBy !== undefined ? overrides.sortBy : deptSort.field;
    const sortDir = overrides.sortDir !== undefined ? overrides.sortDir : deptSort.direction;

    const res = await facilityApi.getDepartments({ page, size, search, status, sortBy, sortDir });
    if (res.success && Array.isArray(res.data)) {
      setDepartments(res.data);
      if (typeof res.totalElements === 'number') setTotalDeptsCount(res.totalElements);
    }
  }, [deptPage, deptPageSize, deptSearch, deptStatusFilter, deptSort]);

  const fetchEmployees = useCallback(async (overrides = {}) => {
    const page = overrides.page !== undefined ? overrides.page : empPage;
    const size = overrides.size !== undefined ? overrides.size : empPageSize;
    const search = overrides.search !== undefined ? overrides.search : empSearch;
    const departmentId = overrides.departmentId !== undefined ? overrides.departmentId : (empDeptFilter === 'ALL' ? undefined : empDeptFilter);
    const role = overrides.role !== undefined ? overrides.role : empRoleFilter;
    const status = overrides.status !== undefined ? overrides.status : empStatusFilter;
    const sortBy = overrides.sortBy !== undefined ? overrides.sortBy : empSort.field;
    const sortDir = overrides.sortDir !== undefined ? overrides.sortDir : empSort.direction;

    const res = await facilityApi.getEmployees({ page, size, search, departmentId, role, status, sortBy, sortDir });
    if (res.success && Array.isArray(res.data)) {
      setEmployees(res.data);
      if (typeof res.totalElements === 'number') setTotalEmpsCount(res.totalElements);
    }
  }, [empPage, empPageSize, empSearch, empDeptFilter, empRoleFilter, empStatusFilter, empSort]);

  const fetchBookings = useCallback(async (overrides = {}) => {
    const page = overrides.page !== undefined ? overrides.page : monitorPage;
    const size = overrides.size !== undefined ? overrides.size : monitorPageSize;
    const search = overrides.search !== undefined ? overrides.search : monitorSearch;
    const floor = overrides.floor !== undefined ? overrides.floor : monitorFloorFilter;
    const status = overrides.status !== undefined ? overrides.status : monitorStatusFilter;

    const res = await facilityApi.getBookings({ page, size, search, floor, status });
    if (res.success && Array.isArray(res.data)) {
      setBookings(res.data);
      if (typeof res.totalElements === 'number') setTotalBookingsCount(res.totalElements);
    }
  }, [monitorPage, monitorPageSize, monitorSearch, monitorFloorFilter, monitorStatusFilter]);

  const fetchMyBookings = useCallback(async () => {
    const res = await facilityApi.getMyBookings();
    if (res.success && Array.isArray(res.data)) {
      setMyBookings(res.data);
    }
  }, []);

  const fetchDirectory = useCallback(async () => {
    const res = await facilityApi.getCompanyDirectory();
    if (res.success && res.data) {
      setDirectoryData(res.data);
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    return Promise.all([
      fetchSummary(),
      fetchRooms(),
      fetchFloors(),
      fetchDepartments(),
      fetchEmployees(),
      fetchBookings(),
      fetchMyBookings(),
      fetchDirectory(),
    ]);
  }, [fetchSummary, fetchRooms, fetchFloors, fetchDepartments, fetchEmployees, fetchBookings, fetchMyBookings, fetchDirectory]);

  // Initial mount load
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Reactive loaders on tab/filter updates
  useEffect(() => {
    if (activeTab === 'rooms') fetchRooms();
  }, [activeTab, roomPage, roomPageSize, roomSearch, roomFloorFilter, roomStatusFilter, roomSort, fetchRooms]);

  useEffect(() => {
    if (activeTab === 'departments') fetchDepartments();
  }, [activeTab, deptPage, deptPageSize, deptSearch, deptStatusFilter, deptSort, fetchDepartments]);

  useEffect(() => {
    if (activeTab === 'employees') fetchEmployees();
  }, [activeTab, empPage, empPageSize, empSearch, empDeptFilter, empRoleFilter, empStatusFilter, empSort, fetchEmployees]);

  useEffect(() => {
    if (activeTab === 'monitor') fetchBookings();
  }, [activeTab, monitorPage, monitorPageSize, monitorSearch, monitorFloorFilter, monitorStatusFilter, fetchBookings]);

  useEffect(() => {
    if (activeTab === 'book-room') {
      fetchMyBookings();
      fetchBookings();
    }
  }, [activeTab, fetchMyBookings, fetchBookings]);

  // ════════════════════ ROOM ACTIONS ════════════════════
  const handleOpenCreateRoom = () => {
    setDrawerRoom(null);
    setEditingRoom(null);
    setRoomForm({
      name: '',
      floor: floors[0] || 'Floor 1',
      location: '',
      capacity: 6,
      description: '',
      status: 'AVAILABLE',
    });
    setIsRoomModalOpen(true);
  };

  const handleOpenEditRoom = (r) => {
    setDrawerRoom(null);
    setEditingRoom(r);
    setRoomForm({
      name: r.name,
      floor: r.floor,
      location: r.location || '',
      capacity: r.capacity || 4,
      description: r.description || '',
      status: r.status || 'AVAILABLE',
    });
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    const payload = {
      ...roomForm,
      capacity: parseInt(roomForm.capacity, 10) || 1,
    };
    if (editingRoom) {
      const res = await facilityApi.updateRoom(editingRoom.id, payload);
      if (res.success) {
        showToast('Room Updated', `Meeting space "${payload.name}" updated successfully.`);
        if (drawerRoom && drawerRoom.id === editingRoom.id) {
          setDrawerRoom((prev) => ({ ...prev, ...payload }));
        }
        setIsRoomModalOpen(false);
        setEditingRoom(null);
        refreshAllData();
      } else {
        showToast('Update Failed', res.error || 'Failed to update room', 'error');
      }
    } else {
      const res = await facilityApi.createRoom(payload);
      if (res.success) {
        showToast('Room Created', `New meeting space "${payload.name}" added to ${payload.floor}.`);
        setIsRoomModalOpen(false);
        setEditingRoom(null);
        refreshAllData();
      } else {
        showToast('Creation Failed', res.error || 'Failed to create room', 'error');
      }
    }
  };

  const handleToggleMaintenance = async (roomId) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) return;

    const nextState = targetRoom.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';

    if (targetRoom.status === 'AVAILABLE') {
      const ok = await confirm({
        title: 'Set Room to Maintenance?',
        subtitle: 'Facility Hardware & Space Servicing',
        message: `Are you sure you want to put "${targetRoom.name}" under maintenance? New bookings will be locked until maintenance is cleared.`,
        targetName: targetRoom.name,
        targetSub: `${targetRoom.floor} • Capacity: ${targetRoom.capacity} seats`,
        confirmText: 'Set Maintenance Mode',
        type: 'warning',
      });
      if (!ok) return;
    }

    const res = await facilityApi.toggleRoomMaintenance(roomId);
    if (res.success) {
      if (drawerRoom && drawerRoom.id === roomId) {
        setDrawerRoom((prev) => (prev ? { ...prev, status: nextState } : null));
      }
      showToast(
        nextState === 'MAINTENANCE' ? 'Maintenance Mode Active' : 'Room Available',
        `"${targetRoom.name}" status updated to ${nextState}.`
      );
      refreshAllData();
    }
  };

  const handleBulkActivateRooms = async () => {
    if (selectedRoomIds.length === 0) return;
    await facilityApi.bulkUpdateRoomStatus(selectedRoomIds, 'AVAILABLE');
    showToast('Bulk Action Complete', `Activated ${selectedRoomIds.length} meeting spaces.`);
    setSelectedRoomIds([]);
    refreshAllData();
  };

  const handleBulkMaintenanceRooms = async () => {
    if (selectedRoomIds.length === 0) return;
    const ok = await confirm({
      title: 'Set Selected Rooms to Maintenance?',
      subtitle: 'Facility Management',
      message: `Put ${selectedRoomIds.length} selected meeting spaces under maintenance?`,
      targetName: `${selectedRoomIds.length} Rooms Selected`,
      confirmText: 'Confirm Maintenance',
      type: 'warning',
    });
    if (!ok) return;

    await facilityApi.bulkUpdateRoomStatus(selectedRoomIds, 'MAINTENANCE');
    showToast('Bulk Action Complete', `Set ${selectedRoomIds.length} rooms to maintenance mode.`, 'warning');
    setSelectedRoomIds([]);
    refreshAllData();
  };

  const handleExportRoomsCSV = () => {
    const targetList = selectedRoomIds.length > 0
      ? rooms.filter((r) => selectedRoomIds.includes(r.id))
      : rooms;

    const headers = ['ID', 'Room Name', 'Floor', 'Location', 'Capacity', 'Status', 'Description'];
    const rows = targetList.map((r) => [
      r.id,
      `"${r.name.replace(/"/g, '""')}"`,
      r.floor,
      `"${(r.location || '').replace(/"/g, '""')}"`,
      r.capacity,
      r.status,
      `"${(r.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `office-rooms-inventory-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Export Successful', `Exported ${targetList.length} rooms to CSV.`);
  };

  // ════════════════════ DEPARTMENT ACTIONS ════════════════════
  const handleOpenCreateDepartment = () => {
    setDrawerRoom(null);
    setDrawerEmployee(null);
    setDrawerBooking(null);
    setEditingDept(null);
    setDeptModalError('');
    setDeptForm({ name: '', status: 'ACTIVE' });
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDepartment = (d) => {
    setDrawerRoom(null);
    setDrawerEmployee(null);
    setDrawerBooking(null);
    setEditingDept(d);
    setDeptModalError('');
    setDeptForm({ name: d.name, status: d.status || 'ACTIVE' });
    setIsDeptModalOpen(true);
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    if (editingDept) {
      const res = await facilityApi.updateDepartment(editingDept.id, deptForm);
      if (res.success) {
        showToast('Department Updated', `Department "${deptForm.name}" updated.`);
        setIsDeptModalOpen(false);
        setEditingDept(null);
        refreshAllData();
      } else {
        setDeptModalError(res.error || 'Failed to update department');
      }
    } else {
      const res = await facilityApi.createDepartment(deptForm);
      if (res.success) {
        showToast('Department Created', `New department "${deptForm.name}" registered.`);
        setIsDeptModalOpen(false);
        setEditingDept(null);
        refreshAllData();
      } else {
        setDeptModalError(res.error || 'Failed to create department');
      }
    }
  };

  const handleToggleDepartmentStatus = async (deptId) => {
    const targetDept = departments.find((d) => d.id === deptId);
    if (!targetDept) return;

    const res = await facilityApi.toggleDepartmentStatus(deptId);
    if (res.success) {
      showToast('Status Updated', `Department "${targetDept.name}" status updated.`);
      refreshAllData();
    }
  };

  const handleViewDepartmentEmployees = (deptId) => {
    setActiveTab('employees');
    setEmpDeptFilter(String(deptId));
    setEmpSearch('');
    setEmpPage(1);
  };

  // ════════════════════ EMPLOYEE ACTIONS ════════════════════
  const handleOpenCreateEmployee = () => {
    setDrawerRoom(null);
    setDrawerEmployee(null);
    setDrawerBooking(null);
    setEditingEmp(null);
    setEmpModalError('');
    setEmpForm({
      fullName: '',
      email: '',
      departmentId: departments[0]?.id || 1,
      role: 'EMPLOYEE',
      password: '',
      status: 'ACTIVE',
    });
    setIsEmpModalOpen(true);
  };

  const handleOpenEditEmployee = (emp) => {
    setDrawerRoom(null);
    setDrawerEmployee(null);
    setDrawerBooking(null);
    setEditingEmp(emp);
    setEmpModalError('');
    setEmpForm({
      fullName: emp.fullName,
      email: emp.email,
      departmentId: emp.departmentId || departments[0]?.id || 1,
      role: emp.role || 'EMPLOYEE',
      password: '',
      status: emp.status || 'ACTIVE',
    });
    setIsEmpModalOpen(true);
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    if (editingEmp) {
      const res = await facilityApi.updateEmployee(editingEmp.id, empForm);
      if (res.success) {
        showToast('Employee Profile Updated', `Details for ${empForm.fullName} updated.`);
        if (drawerEmployee && drawerEmployee.id === editingEmp.id) {
          setDrawerEmployee((prev) => ({ ...prev, ...empForm }));
        }
        setIsEmpModalOpen(false);
        setEditingEmp(null);
        refreshAllData();
      } else {
        setEmpModalError(res.error || 'Failed to update employee');
      }
    } else {
      const res = await facilityApi.createEmployee(empForm);
      if (res.success) {
        showToast('Employee Onboarded', `New employee ${empForm.fullName} added.`);
        setIsEmpModalOpen(false);
        setEditingEmp(null);
        refreshAllData();
      } else {
        setEmpModalError(res.error || 'Failed to create employee');
      }
    }
  };

  const handleToggleEmployeeStatus = async (empId) => {
    const targetEmp = employees.find((e) => e.id === empId);
    if (!targetEmp) return;

    if (targetEmp.status === 'ACTIVE') {
      const ok = await confirm({
        title: 'Suspend Staff Account?',
        subtitle: 'Employee Access Management',
        message: `Are you sure you want to suspend access for "${targetEmp.fullName}"? They will no longer be able to sign in or book rooms.`,
        targetName: targetEmp.fullName,
        targetSub: `${targetEmp.email} • ${targetEmp.departmentName || 'Staff'}`,
        confirmText: 'Suspend Account',
        type: 'danger',
      });
      if (!ok) return;
    }

    const res = await facilityApi.toggleEmployeeStatus(empId);
    if (res.success) {
      if (drawerEmployee && drawerEmployee.id === empId) {
        setDrawerEmployee((prev) => (prev ? { ...prev, status: targetEmp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : null));
      }
      showToast('Account Status Updated', `${targetEmp.fullName} status updated.`);
      refreshAllData();
    }
  };

  const handleBulkActivateEmployees = async () => {
    if (selectedEmpIds.length === 0) return;
    await facilityApi.bulkUpdateEmployeeStatus(selectedEmpIds, 'ACTIVE');
    showToast('Bulk Action Complete', `Activated ${selectedEmpIds.length} staff accounts.`);
    setSelectedEmpIds([]);
    refreshAllData();
  };

  const handleBulkDeactivateEmployees = async () => {
    if (selectedEmpIds.length === 0) return;
    const ok = await confirm({
      title: 'Suspend Selected Accounts?',
      subtitle: 'Staff Account Management',
      message: `Suspend access for ${selectedEmpIds.length} selected employees?`,
      targetName: `${selectedEmpIds.length} Employees Selected`,
      confirmText: 'Suspend Selected',
      type: 'danger',
    });
    if (!ok) return;

    await facilityApi.bulkUpdateEmployeeStatus(selectedEmpIds, 'INACTIVE');
    showToast('Bulk Action Complete', `Suspended ${selectedEmpIds.length} accounts.`, 'warning');
    setSelectedEmpIds([]);
    refreshAllData();
  };

  const handleExportEmployeesCSV = () => {
    const targetList = selectedEmpIds.length > 0
      ? employees.filter((e) => selectedEmpIds.includes(e.id))
      : employees;

    const headers = ['ID', 'Full Name', 'Email', 'Department', 'Role', 'Status', 'Onboarded Date'];
    const rows = targetList.map((e) => [
      e.id,
      `"${e.fullName.replace(/"/g, '""')}"`,
      e.email,
      `"${(e.departmentName || '').replace(/"/g, '""')}"`,
      e.role,
      e.status,
      `"${formatDate(e.createdAt)}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `company-staff-directory-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Export Successful', `Exported ${targetList.length} employees to CSV.`);
  };

  // ════════════════════ BOOKING & SELF-CANCELLATION ════════════════════
  const handleBookRoom = async (bookingPayload) => {
    const res = await facilityApi.createBooking(bookingPayload);
    if (res.success) {
      showToast('Reservation Confirmed', `Reserved ${res.data.roomName} on ${res.data.floor} for "${res.data.title}".`);
      await refreshAllData();
      return true;
    } else {
      showToast('Booking Conflict', res.error || 'Failed to book room', 'error');
      return false;
    }
  };

  const handleCancelBooking = async (booking) => {
    const ok = await confirm({
      title: 'Cancel Room Reservation?',
      subtitle: 'Meeting Slot Cancellation',
      message: `Are you sure you want to cancel the reservation "${booking.title}" in ${booking.roomName}? This will immediately release the slot for other colleagues.`,
      targetName: booking.title,
      targetSub: `${booking.roomName} (${booking.floor}) • ${booking.startTime?.substring(11, 16)} - ${booking.endTime?.substring(11, 16)}`,
      confirmText: 'Cancel Reservation',
      type: 'danger',
    });
    if (!ok) return;

    const res = await facilityApi.cancelBooking(booking.id);
    if (res.success) {
      if (drawerBooking && drawerBooking.id === booking.id) {
        setDrawerBooking(null);
      }
      showToast('Reservation Cancelled', `Slot for ${booking.roomName} released and marked vacant.`);
      await refreshAllData();
    }
  };

  const handleExportBookingsCSV = () => {
    const headers = ['ID', 'Meeting Title', 'Room', 'Floor', 'Booker', 'Department', 'Start Time', 'End Time', 'Status', 'Attendees'];
    const rows = bookings.map((b) => [
      b.id,
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.roomName.replace(/"/g, '""')}"`,
      b.floor,
      `"${b.bookerName.replace(/"/g, '""')}"`,
      `"${(b.departmentName || '').replace(/"/g, '""')}"`,
      `"${formatDateTime(b.startTime)}"`,
      `"${formatDateTime(b.endTime)}"`,
      b.status,
      b.attendeesCount || 2,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reservations-schedule-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Export Successful', `Exported ${bookings.length} reservations to CSV.`);
  };

  return (
    <div className="superadmin-portal facility-admin-portal">
      <div className="container">
        {/* Top Metrics Cards */}
        <FacilityAdminMetrics
          totalRooms={summary.totalRooms || rooms.length}
          availableRooms={summary.availableRooms || 0}
          maintenanceRooms={summary.maintenanceRooms || 0}
          totalDepartments={summary.totalDepartments || departments.length}
          totalEmployees={summary.totalEmployees || employees.length}
          todayBookings={summary.todayBookingsCount || bookings.length}
          activeTab={activeTab}
          onSelectMetric={(tabKey, filters) => {
            setActiveTab(tabKey);
            if (filters?.status && tabKey === 'rooms') {
              setRoomStatusFilter(filters.status);
            }
          }}
        />

        {/* Tab Switcher Header */}
        <FacilityAdminTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          roomsCount={totalRoomsCount || rooms.length}
          departmentsCount={totalDeptsCount || departments.length}
          employeesCount={totalEmpsCount || employees.length}
          bookingsCount={totalBookingsCount || bookings.length}
          myBookingsCount={myBookings.filter((b) => b.status === 'CONFIRMED').length}
          onOpenCreateRoom={handleOpenCreateRoom}
          onOpenCreateDepartment={handleOpenCreateDepartment}
          onOpenCreateEmployee={handleOpenCreateEmployee}
          onOpenBookRoom={() => setActiveTab('book-room')}
        />

        {/* Master Content Panel */}
        <div className="superadmin-panel">
          {/* Tab 1: Room Management */}
          {activeTab === 'rooms' && (
            <RoomsTab
              rooms={rooms}
              floors={floors}
              search={roomSearch}
              onSearchChange={setRoomSearch}
              floorFilter={roomFloorFilter}
              onFloorFilterChange={setRoomFloorFilter}
              statusFilter={roomStatusFilter}
              onStatusFilterChange={setRoomStatusFilter}
              sortBy={roomSort.field}
              sortDir={roomSort.direction}
              onSort={(field) =>
                setRoomSort((prev) => ({
                  field,
                  direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
                }))
              }
              selectedRoomIds={selectedRoomIds}
              onSelectAll={(e) => {
                if (e.target.checked) setSelectedRoomIds(rooms.map((r) => r.id));
                else setSelectedRoomIds([]);
              }}
              onToggleSelect={(id) =>
                setSelectedRoomIds((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                )
              }
              onOpenCreateRoom={handleOpenCreateRoom}
              onOpenEditRoom={handleOpenEditRoom}
              onToggleMaintenance={handleToggleMaintenance}
              onInspectRoom={setDrawerRoom}
              onBookRoom={(r) => {
                setActiveTab('book-room');
              }}
              onBulkActivate={handleBulkActivateRooms}
              onBulkMaintenance={handleBulkMaintenanceRooms}
              onExportCSV={handleExportRoomsCSV}
              page={roomPage}
              pageSize={roomPageSize}
              totalCount={totalRoomsCount || rooms.length}
              onPageChange={setRoomPage}
            />
          )}

          {/* Tab 2: Departments */}
          {activeTab === 'departments' && (
            <DepartmentsTab
              departments={departments}
              search={deptSearch}
              onSearchChange={setDeptSearch}
              statusFilter={deptStatusFilter}
              onStatusFilterChange={setDeptStatusFilter}
              sortBy={deptSort.field}
              sortDir={deptSort.direction}
              onSort={(field) =>
                setDeptSort((prev) => ({
                  field,
                  direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
                }))
              }
              onOpenCreateDepartment={handleOpenCreateDepartment}
              onOpenEditDepartment={handleOpenEditDepartment}
              onToggleStatus={handleToggleDepartmentStatus}
              onViewDepartmentEmployees={handleViewDepartmentEmployees}
              page={deptPage}
              pageSize={deptPageSize}
              totalCount={totalDeptsCount || departments.length}
              onPageChange={setDeptPage}
            />
          )}

          {/* Tab 3: Employees */}
          {activeTab === 'employees' && (
            <EmployeesTab
              employees={employees}
              departments={departments}
              search={empSearch}
              onSearchChange={setEmpSearch}
              departmentFilter={empDeptFilter}
              onDepartmentFilterChange={setEmpDeptFilter}
              statusFilter={empStatusFilter}
              onStatusFilterChange={setEmpStatusFilter}
              roleFilter={empRoleFilter}
              onRoleFilterChange={setEmpRoleFilter}
              sortBy={empSort.field}
              sortDir={empSort.direction}
              onSort={(field) =>
                setEmpSort((prev) => ({
                  field,
                  direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
                }))
              }
              selectedEmployeeIds={selectedEmpIds}
              onSelectAll={(e) => {
                if (e.target.checked) setSelectedEmpIds(employees.map((emp) => emp.id));
                else setSelectedEmpIds([]);
              }}
              onToggleSelect={(id) =>
                setSelectedEmpIds((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                )
              }
              onOpenCreateEmployee={handleOpenCreateEmployee}
              onOpenEditEmployee={handleOpenEditEmployee}
              onToggleStatus={handleToggleEmployeeStatus}
              onInspectEmployee={setDrawerEmployee}
              onBulkActivate={handleBulkActivateEmployees}
              onBulkDeactivate={handleBulkDeactivateEmployees}
              onExportCSV={handleExportEmployeesCSV}
              page={empPage}
              pageSize={empPageSize}
              totalCount={totalEmpsCount || employees.length}
              onPageChange={setEmpPage}
            />
          )}

          {/* Tab 4: Book a Room & My Scheduled Reservations */}
          {activeTab === 'book-room' && (
            <BookRoomTab
              rooms={rooms}
              floors={floors}
              departments={departments}
              myBookings={myBookings}
              allBookings={bookings}
              onBookRoom={handleBookRoom}
              onCancelBooking={handleCancelBooking}
              currentUser={user}
            />
          )}

          {/* Tab 5: Live Room Booking Monitor */}
          {activeTab === 'monitor' && (
            <BookingMonitorTab
              rooms={rooms}
              floors={floors}
              bookings={bookings}
              search={monitorSearch}
              onSearchChange={setMonitorSearch}
              floorFilter={monitorFloorFilter}
              onFloorFilterChange={setMonitorFloorFilter}
              statusFilter={monitorStatusFilter}
              onStatusFilterChange={setMonitorStatusFilter}
              dateFilter={monitorDate}
              onDateFilterChange={setMonitorDate}
              onInspectBooking={setDrawerBooking}
              onCancelBooking={handleCancelBooking}
              onExportCSV={handleExportBookingsCSV}
              onInspectRoom={setDrawerRoom}
              page={monitorPage}
              pageSize={monitorPageSize}
              totalCount={totalBookingsCount || bookings.length}
              onPageChange={setMonitorPage}
            />
          )}

          {/* Tab 6: Company Directory */}
          {activeTab === 'directory' && (
            <CompanyDirectoryTab
              directoryData={directoryData}
              rooms={rooms}
              departments={departments}
              employees={employees}
              onExportCSV={handleExportEmployeesCSV}
            />
          )}
        </div>
      </div>

      {/* Slide-Over Drawers */}
      <RoomInspectorDrawer
        room={drawerRoom}
        onClose={() => setDrawerRoom(null)}
        onEdit={handleOpenEditRoom}
        onToggleMaintenance={handleToggleMaintenance}
        onBookRoom={(r) => {
          setDrawerRoom(null);
          setActiveTab('book-room');
        }}
        todayBookings={bookings}
      />

      <EmployeeInspectorDrawer
        employee={drawerEmployee}
        onClose={() => setDrawerEmployee(null)}
        onEdit={handleOpenEditEmployee}
        onToggleStatus={handleToggleEmployeeStatus}
      />

      <BookingInspectorDrawer
        booking={drawerBooking}
        onClose={() => setDrawerBooking(null)}
        onCancelBooking={handleCancelBooking}
      />

      {/* Modals */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        editingRoom={editingRoom}
        form={roomForm}
        onChange={setRoomForm}
        onSubmit={handleSaveRoom}
        floors={floors}
      />

      <DepartmentModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        editingDepartment={editingDept}
        form={deptForm}
        onChange={setDeptForm}
        onSubmit={handleSaveDepartment}
        error={deptModalError}
      />

      <EmployeeModal
        isOpen={isEmpModalOpen}
        onClose={() => setIsEmpModalOpen(false)}
        editingEmployee={editingEmp}
        form={empForm}
        onChange={setEmpForm}
        onSubmit={handleSaveEmployee}
        departments={departments}
        error={empModalError}
      />
    </div>
  );
}
