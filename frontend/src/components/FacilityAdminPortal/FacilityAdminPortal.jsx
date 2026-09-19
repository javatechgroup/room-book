import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { facilityApi } from '../../api/facilityApi';
import FacilityAdminMetrics from './components/FacilityAdminMetrics';
import FacilityAdminTabs from './components/FacilityAdminTabs';
import RoomsTab from './components/RoomsTab';
import RoomModal from './components/RoomModal';
import RoomInspectorDrawer from './components/RoomInspectorDrawer';
import FloorInspectorDrawer from './components/FloorInspectorDrawer';
import DepartmentInspectorDrawer from './components/DepartmentInspectorDrawer';
import FloorsTab from './components/FloorsTab';
import FloorModal from './components/FloorModal';
import DepartmentsTab from './components/DepartmentsTab';
import DepartmentModal from './components/DepartmentModal';
import EmployeesTab from './components/EmployeesTab';
import EmployeeModal from './components/EmployeeModal';
import EmployeeInspectorDrawer from './components/EmployeeInspectorDrawer';
import BookRoomTab from './components/BookRoomTab';
import FacilityMyBookingsTab from './components/FacilityMyBookingsTab';
import BookingMonitorTab from './components/BookingMonitorTab';
import BookingInspectorDrawer from './components/BookingInspectorDrawer';
import CompanyDirectoryTab from './components/CompanyDirectoryTab';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import './FacilityAdminPortal.css';

const DEFAULT_SUMMARY = {
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
};

export default function FacilityAdminPortal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' | 'departments' | 'employees' | 'book-room' | 'monitor' | 'directory'
  const panelRef = useRef(null);

  const scrollToDataPanelOnMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 900) {
      setTimeout(() => {
        if (panelRef.current) {
          const headerOffset = 75;
          const elPosition = panelRef.current.getBoundingClientRect().top;
          const offsetPosition = elPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth',
          });
        }
      }, 60);
    }
  };

  // Summary Metrics State
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);

  // ════════════════════ PRIMARY DATA STATES ════════════════════
  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [bookings, setBookings] = useState([]);
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

  // Floors Tab
  const [floorsList, setFloorsList] = useState([]);
  const [floorSearch, setFloorSearch] = useState('');
  const [floorStatusFilter, setFloorStatusFilter] = useState('ALL');
  const [floorPage, setFloorPage] = useState(1);
  const [floorPageSize, setFloorPageSize] = useState(10);
  const [totalFloorsCount, setTotalFloorsCount] = useState(0);

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
  const [totalCompanyEmployees, setTotalCompanyEmployees] = useState(0);
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
  const [drawerFloor, setDrawerFloor] = useState(null);
  const [drawerDepartment, setDrawerDepartment] = useState(null);
  const [drawerEmployee, setDrawerEmployee] = useState(null);
  const [drawerBooking, setDrawerBooking] = useState(null);

  const closeAllDrawers = () => {
    setDrawerRoom(null);
    setDrawerFloor(null);
    setDrawerDepartment(null);
    setDrawerEmployee(null);
    setDrawerBooking(null);
  };

  // Room Modal
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    name: '',
    floor: '',
    location: '',
    capacity: 6,
    description: '',
    status: 'AVAILABLE',
  });

  // Floor Modal
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);
  const [floorForm, setFloorForm] = useState({
    name: '',
    floorNumber: '',
    description: '',
    status: 'ACTIVE',
  });
  const [floorModalError, setFloorModalError] = useState('');

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
    departmentId: '',
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
      if (typeof res.data.totalFloors === 'number') {
        setTotalFloorsCount(res.data.totalFloors);
      }
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
    const res = await facilityApi.getAllFloors();
    if (res.success && Array.isArray(res.data)) {
      setFloors(res.data.map((f) => (typeof f === 'string' ? f : f.name)));
      setTotalFloorsCount((prev) => (prev > 0 ? prev : res.data.length));
    } else {
      const fallbackRes = await facilityApi.getFloors();
      if (fallbackRes.success && Array.isArray(fallbackRes.data)) {
        setFloors(fallbackRes.data);
        setTotalFloorsCount((prev) => (prev > 0 ? prev : fallbackRes.data.length));
      }
    }
  }, []);

  const fetchFloorsList = useCallback(async (overrides = {}) => {
    const page = overrides.page !== undefined ? overrides.page : floorPage;
    const size = overrides.size !== undefined ? overrides.size : floorPageSize;
    const search = overrides.search !== undefined ? overrides.search : floorSearch;
    const status = overrides.status !== undefined ? overrides.status : floorStatusFilter;

    const res = await facilityApi.getFloorsList({ page, size, search, status });
    if (res.success && Array.isArray(res.data)) {
      setFloorsList(res.data);
      if (typeof res.totalElements === 'number') setTotalFloorsCount(res.totalElements);
    }
  }, [floorPage, floorPageSize, floorSearch, floorStatusFilter]);

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
      if (typeof res.totalElements === 'number') {
        setTotalEmpsCount(res.totalElements);
        if (!departmentId && (!search || search.trim() === '') && status === 'ALL' && role === 'ALL') {
          setTotalCompanyEmployees(res.totalElements);
        }
      }
    }
  }, [empPage, empPageSize, empSearch, empDeptFilter, empRoleFilter, empStatusFilter, empSort]);

  const fetchBookings = useCallback(async (overrides = {}) => {
    const page = overrides.page !== undefined ? overrides.page : monitorPage;
    const size = overrides.size !== undefined ? overrides.size : monitorPageSize;
    const search = overrides.search !== undefined ? overrides.search : monitorSearch;
    const floor = overrides.floor !== undefined ? overrides.floor : monitorFloorFilter;

    const res = await facilityApi.getBookings({ page, size, search, floor, status: 'ALL' });
    if (res.success && Array.isArray(res.data)) {
      setBookings(res.data);
      if (typeof res.totalElements === 'number') setTotalBookingsCount(res.totalElements);
    }
  }, [monitorPage, monitorPageSize, monitorSearch, monitorFloorFilter]);

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
      fetchFloorsList(),
      fetchDepartments(),
      fetchEmployees(),
      fetchBookings(),
      fetchMyBookings(),
      fetchDirectory(),
    ]);
  }, [fetchSummary, fetchRooms, fetchFloors, fetchFloorsList, fetchDepartments, fetchEmployees, fetchBookings, fetchMyBookings, fetchDirectory]);

  // Initial mount load: load core metadata (Summary, Floors, Floors List, and My Bookings count)
  useEffect(() => {
    fetchSummary();
    fetchFloors();
    fetchFloorsList();
    fetchMyBookings();
  }, [fetchSummary, fetchFloors, fetchFloorsList, fetchMyBookings]);

  // On-demand reactive loaders per active tab
  useEffect(() => {
    if (activeTab === 'rooms') fetchRooms();
  }, [activeTab, roomPage, roomPageSize, roomSearch, roomFloorFilter, roomStatusFilter, roomSort, fetchRooms]);

  useEffect(() => {
    if (activeTab === 'floors') fetchFloorsList();
  }, [activeTab, floorPage, floorPageSize, floorSearch, floorStatusFilter, fetchFloorsList]);

  useEffect(() => {
    if (activeTab === 'departments') fetchDepartments();
  }, [activeTab, deptPage, deptPageSize, deptSearch, deptStatusFilter, deptSort, fetchDepartments]);

  useEffect(() => {
    if (activeTab === 'employees') {
      fetchEmployees();
      fetchDepartments();
    }
  }, [activeTab, empPage, empPageSize, empSearch, empDeptFilter, empRoleFilter, empStatusFilter, empSort, fetchEmployees, fetchDepartments]);

  useEffect(() => {
    if (activeTab === 'monitor') {
      fetchBookings();
      const interval = setInterval(() => {
        fetchBookings();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab, monitorPage, monitorPageSize, monitorSearch, monitorFloorFilter, fetchBookings]);

  useEffect(() => {
    if (activeTab === 'book-room') {
      fetchRooms();
      fetchDepartments();
      fetchMyBookings();
      fetchBookings();
    } else if (activeTab === 'my-bookings') {
      fetchMyBookings();
    }
  }, [activeTab, fetchRooms, fetchDepartments, fetchMyBookings, fetchBookings]);

  useEffect(() => {
    if (activeTab === 'directory') {
      fetchDirectory();
    }
  }, [activeTab, fetchDirectory]);

  // ════════════════════ ROOM ACTIONS ════════════════════
  const handleOpenCreateRoom = () => {
    closeAllDrawers();
    setEditingRoom(null);
    setRoomForm({
      name: '',
      floor: floors[0] || '',
      location: '',
      capacity: 6,
      description: '',
      status: 'AVAILABLE',
    });
    setIsRoomModalOpen(true);
  };

  const handleOpenEditRoom = (r) => {
    closeAllDrawers();
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

    const isToMaintenance = targetRoom.status !== 'MAINTENANCE';
    const nextState = isToMaintenance ? 'MAINTENANCE' : 'AVAILABLE';

    const ok = await confirm({
      title: isToMaintenance ? 'Set Room to Maintenance?' : 'Make Room Available?',
      subtitle: 'Facility Hardware & Space Servicing',
      message: isToMaintenance
        ? `Are you sure you want to put "${targetRoom.name}" under maintenance? New bookings will be locked until maintenance is cleared.`
        : `Are you sure you want to activate "${targetRoom.name}" and make it available for bookings?`,
      targetName: targetRoom.name,
      targetSub: `${targetRoom.floor} • Capacity: ${targetRoom.capacity} seats`,
      confirmText: isToMaintenance ? 'Set Maintenance Mode' : 'Make Available',
      type: isToMaintenance ? 'warning' : 'primary',
    });
    if (!ok) return;

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
    const ok = await confirm({
      title: 'Make Selected Rooms Available?',
      subtitle: 'Facility Space Management',
      message: `Are you sure you want to activate ${selectedRoomIds.length} meeting spaces and make them available for bookings?`,
      targetName: `${selectedRoomIds.length} Rooms Selected`,
      confirmText: 'Activate Rooms',
      type: 'primary',
    });
    if (!ok) return;

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

  // ════════════════════ FLOORS CRUD ════════════════════
  const handleOpenCreateFloor = () => {
    closeAllDrawers();
    setEditingFloor(null);
    setFloorModalError('');
    setFloorForm({ name: '', floorNumber: '', description: '', status: 'ACTIVE' });
    setIsFloorModalOpen(true);
  };

  const handleOpenEditFloor = (floor) => {
    closeAllDrawers();
    setEditingFloor(floor);
    setFloorModalError('');
    setFloorForm({
      name: floor.name || '',
      floorNumber: floor.floorNumber !== null && floor.floorNumber !== undefined ? floor.floorNumber : '',
      description: floor.description || '',
      status: floor.status || 'ACTIVE',
    });
    setIsFloorModalOpen(true);
  };

  const handleSaveFloor = async (e) => {
    e.preventDefault();
    setFloorModalError('');
    if (!floorForm.name.trim()) {
      setFloorModalError('Floor name is required');
      return;
    }
    const payload = {
      name: floorForm.name.trim(),
      floorNumber: floorForm.floorNumber !== '' ? Number(floorForm.floorNumber) : null,
      description: floorForm.description ? floorForm.description.trim() : null,
      status: floorForm.status || 'ACTIVE',
    };

    if (editingFloor) {
      const res = await facilityApi.updateFloor(editingFloor.id, payload);
      if (res.success) {
        if (drawerFloor && drawerFloor.id === editingFloor.id) {
          setDrawerFloor((prev) => (prev ? { ...prev, ...payload } : null));
        }
        showToast('Floor Updated', `Floor "${payload.name}" updated successfully.`);
        setIsFloorModalOpen(false);
        setEditingFloor(null);
        refreshAllData();
      } else {
        setFloorModalError(res.error || 'Failed to update floor');
      }
    } else {
      const res = await facilityApi.createFloor(payload);
      if (res.success) {
        showToast('Floor Created', `New floor "${payload.name}" registered successfully.`);
        setIsFloorModalOpen(false);
        setEditingFloor(null);
        refreshAllData();
      } else {
        setFloorModalError(res.error || 'Failed to create floor');
      }
    }
  };

  const handleToggleFloorStatus = async (floor) => {
    const isDeactivating = floor.status === 'ACTIVE';
    const nextStatus = isDeactivating ? 'INACTIVE' : 'ACTIVE';

    const ok = await confirm({
      title: isDeactivating ? 'Deactivate Floor?' : 'Activate Floor?',
      subtitle: 'Facility Workplace Management',
      message: isDeactivating
        ? `Are you sure you want to deactivate "${floor.name}"? Spaces and services on this level will be marked inactive.`
        : `Are you sure you want to activate "${floor.name}"?`,
      targetName: floor.name,
      targetSub: floor.floorNumber !== null && floor.floorNumber !== undefined ? `Level #${floor.floorNumber}` : 'Standard Level',
      confirmText: isDeactivating ? 'Deactivate Floor' : 'Activate Floor',
      type: isDeactivating ? 'danger' : 'primary',
    });
    if (!ok) return;

    const res = await facilityApi.toggleFloorStatus(floor.id);
    if (res.success) {
      if (drawerFloor && drawerFloor.id === floor.id) {
        setDrawerFloor((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
      showToast('Status Updated', `Floor "${floor.name}" status set to ${nextStatus}.`);
      refreshAllData();
    } else {
      showToast('Action Failed', res.error || 'Could not update floor status', 'error');
    }
  };

  const handleDeleteFloor = async (floor) => {
    const ok = await confirm({
      title: 'Delete Floor?',
      subtitle: 'Facility Workplace Management',
      message: `Are you sure you want to permanently delete "${floor.name}"? This action cannot be undone.`,
      targetName: floor.name,
      confirmText: 'Confirm Delete',
      type: 'danger',
    });
    if (!ok) return;

    const res = await facilityApi.deleteFloor(floor.id);
    if (res.success) {
      showToast('Floor Deleted', `Floor "${floor.name}" was removed successfully.`);
      refreshAllData();
    } else {
      showToast('Delete Blocked', res.error || 'Could not delete floor', 'error');
    }
  };

  // ════════════════════ DEPARTMENTS CRUD ════════════════════
  const handleOpenCreateDepartment = () => {
    closeAllDrawers();
    setEditingDept(null);
    setDeptModalError('');
    setDeptForm({ name: '', status: 'ACTIVE' });
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDepartment = (d) => {
    closeAllDrawers();
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
        if (drawerDepartment && drawerDepartment.id === editingDept.id) {
          setDrawerDepartment((prev) => (prev ? { ...prev, ...deptForm } : null));
        }
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

    const isDeactivating = targetDept.status === 'ACTIVE';
    const nextStatus = isDeactivating ? 'INACTIVE' : 'ACTIVE';

    const ok = await confirm({
      title: isDeactivating ? 'Deactivate Department?' : 'Activate Department?',
      subtitle: 'Department Management',
      message: isDeactivating
        ? `Are you sure you want to deactivate "${targetDept.name}"? Staff assignments for this unit will be updated.`
        : `Are you sure you want to activate "${targetDept.name}"?`,
      targetName: targetDept.name,
      targetSub: `ID: #${targetDept.id} • ${targetDept.employeeCount || 0} Staff Members`,
      confirmText: isDeactivating ? 'Deactivate Department' : 'Activate Department',
      type: isDeactivating ? 'danger' : 'primary',
    });
    if (!ok) return;

    const res = await facilityApi.toggleDepartmentStatus(deptId);
    if (res.success) {
      if (drawerDepartment && drawerDepartment.id === deptId) {
        setDrawerDepartment((prev) =>
          prev
            ? { ...prev, status: nextStatus }
            : null
        );
      }
      showToast('Status Updated', `Department "${targetDept.name}" status updated.`);
      refreshAllData();
    }
  };

  const handleViewDepartmentEmployees = (deptId) => {
    closeAllDrawers();
    setActiveTab('employees');
    setEmpDeptFilter(String(deptId));
    setEmpSearch('');
    setEmpPage(1);
  };

  // ════════════════════ EMPLOYEE ACTIONS ════════════════════
  const handleOpenCreateEmployee = () => {
    closeAllDrawers();
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
    closeAllDrawers();
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

    const isDeactivating = targetEmp.status === 'ACTIVE';
    const nextStatus = isDeactivating ? 'INACTIVE' : 'ACTIVE';

    const ok = await confirm({
      title: isDeactivating ? 'Suspend Staff Account?' : 'Activate Staff Account?',
      subtitle: 'Employee Access Management',
      message: isDeactivating
        ? `Are you sure you want to suspend access for "${targetEmp.fullName}"? They will no longer be able to sign in or book rooms.`
        : `Are you sure you want to restore active access for "${targetEmp.fullName}"?`,
      targetName: targetEmp.fullName,
      targetSub: `${targetEmp.email} • ${targetEmp.departmentName || 'Staff'}`,
      confirmText: isDeactivating ? 'Suspend Account' : 'Activate Account',
      type: isDeactivating ? 'danger' : 'primary',
    });
    if (!ok) return;

    const res = await facilityApi.toggleEmployeeStatus(empId);
    if (res.success) {
      if (drawerEmployee && drawerEmployee.id === empId) {
        setDrawerEmployee((prev) => (prev ? { ...prev, status: nextStatus } : null));
      }
      showToast('Account Status Updated', `${targetEmp.fullName} status updated.`);
      refreshAllData();
    }
  };

  const handleBulkActivateEmployees = async () => {
    if (selectedEmpIds.length === 0) return;
    const ok = await confirm({
      title: 'Activate Selected Accounts?',
      subtitle: 'Staff Account Management',
      message: `Are you sure you want to restore active access for ${selectedEmpIds.length} staff accounts?`,
      targetName: `${selectedEmpIds.length} Accounts Selected`,
      confirmText: 'Activate Accounts',
      type: 'primary',
    });
    if (!ok) return;

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
          totalFloors={totalFloorsCount || floorsList.length || floors.length || summary.totalFloors || 0}
          totalDepartments={summary.totalDepartments || departments.length}
          totalEmployees={summary.totalEmployees || employees.length}
          todayBookings={summary.todayBookingsCount || bookings.length}
          activeTab={activeTab}
          onSelectMetric={(tabKey, filters) => {
            closeAllDrawers();
            setActiveTab(tabKey);
            if (filters?.status && tabKey === 'rooms') {
              setRoomStatusFilter(filters.status);
            }
            scrollToDataPanelOnMobile();
          }}
        />

        {/* Tab Switcher Header */}
        <FacilityAdminTabs
          activeTab={activeTab}
          onTabChange={(tabKey) => {
            closeAllDrawers();
            setActiveTab(tabKey);
            if (tabKey === 'employees') {
              setEmpDeptFilter('ALL');
              setEmpSearch('');
              setEmpPage(1);
            }
            scrollToDataPanelOnMobile();
          }}
          roomsCount={summary.totalRooms || totalRoomsCount || rooms.length}
          floorsCount={totalFloorsCount || floorsList.length || floors.length || summary.totalFloors || 0}
          departmentsCount={summary.totalDepartments || totalDeptsCount || departments.length}
          employeesCount={summary.totalEmployees || totalCompanyEmployees || totalEmpsCount || employees.length}
          bookingsCount={summary.todayBookingsCount || totalBookingsCount || bookings.length}
          myBookingsCount={myBookings.length}
        />

        {/* Master Content Panel */}
        <div className="superadmin-panel" ref={panelRef}>
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
              onPageSizeChange={(newSize) => {
                setRoomPageSize(newSize);
                setRoomPage(1);
              }}
            />
          )}

          {/* Tab: Floors Management */}
          {activeTab === 'floors' && (
            <FloorsTab
              floors={floorsList}
              search={floorSearch}
              onSearchChange={(val) => {
                setFloorSearch(val);
                setFloorPage(1);
              }}
              statusFilter={floorStatusFilter}
              onStatusFilterChange={(st) => {
                setFloorStatusFilter(st);
                setFloorPage(1);
              }}
              onOpenCreateFloor={handleOpenCreateFloor}
              onOpenEditFloor={handleOpenEditFloor}
              onToggleStatus={handleToggleFloorStatus}
              onDeleteFloor={handleDeleteFloor}
              onInspectFloor={setDrawerFloor}
              page={floorPage}
              pageSize={floorPageSize}
              totalCount={totalFloorsCount || floorsList.length}
              onPageChange={setFloorPage}
              onPageSizeChange={(newSize) => {
                setFloorPageSize(newSize);
                setFloorPage(1);
              }}
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
              onInspectDepartment={setDrawerDepartment}
              page={deptPage}
              pageSize={deptPageSize}
              totalCount={totalDeptsCount || departments.length}
              onPageChange={setDeptPage}
              onPageSizeChange={(newSize) => {
                setDeptPageSize(newSize);
                setDeptPage(1);
              }}
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
              onPageSizeChange={(newSize) => {
                setEmpPageSize(newSize);
                setEmpPage(1);
              }}
            />
          )}

          {/* Tab 4: Book a Room & 3 Latest Reservations Preview */}
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
              onNavigateToMyBookings={() => setActiveTab('my-bookings')}
            />
          )}

          {/* Tab 5: My Bookings (Dedicated User Reservations Tab) */}
          {activeTab === 'my-bookings' && (
            <FacilityMyBookingsTab
              myBookings={myBookings}
              floors={floors}
              onInspectBooking={setDrawerBooking}
              onCancelBooking={handleCancelBooking}
              onOpenBookRoom={() => setActiveTab('book-room')}
              onExportCSV={handleExportBookingsCSV}
            />
          )}

          {/* Tab 6: Live Room Booking Monitor */}
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
              onPageSizeChange={(newSize) => {
                setMonitorPageSize(newSize);
                setMonitorPage(1);
              }}
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

      <FloorInspectorDrawer
        floor={drawerFloor}
        onClose={() => setDrawerFloor(null)}
        onEdit={handleOpenEditFloor}
        onToggleStatus={handleToggleFloorStatus}
      />

      <DepartmentInspectorDrawer
        department={drawerDepartment}
        onClose={() => setDrawerDepartment(null)}
        onEdit={handleOpenEditDepartment}
        onToggleStatus={handleToggleDepartmentStatus}
        onViewEmployees={handleViewDepartmentEmployees}
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
        onNavigateToFloors={() => {
          setIsRoomModalOpen(false);
          setActiveTab('floors');
        }}
      />

      <FloorModal
        isOpen={isFloorModalOpen}
        onClose={() => setIsFloorModalOpen(false)}
        editingFloor={editingFloor}
        form={floorForm}
        onChange={setFloorForm}
        onSubmit={handleSaveFloor}
        error={floorModalError}
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
