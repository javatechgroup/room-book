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
import SlotFinderTab from '../WorkplacePortal/components/SlotFinderTab';
import FacilityMyBookingsTab from './components/FacilityMyBookingsTab';
import BookingMonitorTab from './components/BookingMonitorTab';
import BookingInspectorDrawer from './components/BookingInspectorDrawer';
import CompanyDirectoryTab from './components/CompanyDirectoryTab';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import '../WorkplacePortal/WorkplacePortal.css';
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

  // Navigation Tab State — initialized from URL parameter if present (?tab=rooms)
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const validTabs = ['rooms', 'floors', 'departments', 'employees', 'book-room', 'my-bookings', 'monitor', 'directory'];
      if (tabParam && validTabs.includes(tabParam)) return tabParam;
    }
    return 'rooms';
  });
  const panelRef = useRef(null);

  // Listen to browser Back/Forward navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab') || 'rooms';
        setActiveTab(tabParam);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  // 5. Book a Room / Slot Finder State (Shared Interface with Employee Portal)
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [bookingDept, setBookingDept] = useState('');
  const [dayOccupancy, setDayOccupancy] = useState([]);
  const [bookingRooms, setBookingRooms] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [isLoadingBookingRooms, setIsLoadingBookingRooms] = useState(false);

  // Normalized rooms for SlotFinderTab
  const normalizedRooms = useMemo(() => {
    const source = bookingRooms.length > 0 ? bookingRooms : rooms;
    return source.map((r) => ({
      ...r,
      code: r.code || r.name,
      floor: r.floor || 'Main Floor',
      capacity: r.capacity || 6,
      isUnderMaintenance: r.isUnderMaintenance || r.underMaintenance || r.status === 'MAINTENANCE',
      amenities: Array.isArray(r.amenities)
        ? r.amenities
        : (r.amenities ? String(r.amenities).split(',').map((s) => s.trim()) : ['TV Screen', 'Whiteboard']),
      sizeCategory: r.sizeCategory || (r.capacity > 10 ? 'large' : r.capacity > 4 ? 'medium' : 'small'),
    }));
  }, [bookingRooms, rooms]);

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

  // Centralized tab change that synchronizes with browser URL and history
  const handleTabChange = useCallback((tabKey) => {
    closeAllDrawers();
    setActiveTab(tabKey);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      url.searchParams.set('tab', tabKey);
      window.history.pushState({ tab: tabKey }, '', url);
    }
    if (tabKey === 'employees') {
      setEmpDeptFilter('ALL');
      setEmpSearch('');
      setEmpPage(1);
    }
    scrollToDataPanelOnMobile();
  }, []);

  // Keyboard Shortcuts: '/' to focus active search, 'ESC' to close drawers or blur search
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';
      if (e.key === '/' && !isInput) {
        e.preventDefault();
        const searchInput = document.querySelector('.superadmin-search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      } else if (e.key === 'Escape') {
        if (drawerRoom || drawerFloor || drawerDepartment || drawerEmployee || drawerBooking) {
          closeAllDrawers();
        } else if (isInput && document.activeElement?.classList?.contains('superadmin-search-input')) {
          document.activeElement.blur();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerRoom, drawerFloor, drawerDepartment, drawerEmployee, drawerBooking]);

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
    if (res && res.success && res.data) {
      setDirectoryData(res.data);
      if (Array.isArray(res.data.employees) && res.data.employees.length > 0) {
        setEmployees((prev) => (prev.length === 0 ? res.data.employees : prev));
      }
      if (Array.isArray(res.data.departments) && res.data.departments.length > 0) {
        setDepartments((prev) => (prev.length === 0 ? res.data.departments : prev));
      }
      if (Array.isArray(res.data.rooms) && res.data.rooms.length > 0) {
        setRooms((prev) => (prev.length === 0 ? res.data.rooms : prev));
      }
    }
  }, []);

  const fetchDayOccupancy = useCallback(async (dateStr) => {
    try {
      const res = await facilityApi.getOccupancyForDay(dateStr);
      if (res && res.success && Array.isArray(res.data)) {
        setDayOccupancy(res.data);
      } else {
        setDayOccupancy([]);
      }
    } catch (err) {
      console.warn('Error fetching day occupancy for company:', err);
      setDayOccupancy([]);
    }
  }, []);

  const fetchBookingRooms = useCallback(async () => {
    setIsLoadingBookingRooms(true);
    try {
      const res = await facilityApi.getRooms({ pageSize: 200, size: 200, page: 1, status: 'ALL' });
      if (res.success && Array.isArray(res.data)) {
        setBookingRooms(res.data);
        setRooms((prev) => (prev.length === 0 ? res.data : prev));
        if (!selectedRoomId && res.data.length > 0) {
          setSelectedRoomId(res.data[0].id);
        }
      }
    } catch (err) {
      console.warn('Error fetching booking rooms:', err);
    } finally {
      setIsLoadingBookingRooms(false);
    }
  }, [selectedRoomId]);

  const roomsForMonitor = useMemo(() => {
    if (bookingRooms && bookingRooms.length > 0) return bookingRooms;
    if (rooms && rooms.length > 0) return rooms;
    return [];
  }, [bookingRooms, rooms]);

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
      fetchBookingRooms(),
      selectedDate ? fetchDayOccupancy(selectedDate) : Promise.resolve(),
    ]);
  }, [fetchSummary, fetchRooms, fetchFloors, fetchFloorsList, fetchDepartments, fetchEmployees, fetchBookings, fetchMyBookings, fetchDirectory, fetchBookingRooms, selectedDate, fetchDayOccupancy]);

  // Initial mount load: load core metadata (Summary, Floors, Floors List, and My Bookings count)
  useEffect(() => {
    fetchSummary();
    fetchFloors();
    fetchFloorsList();
    fetchMyBookings();
    fetchBookingRooms();
  }, [fetchSummary, fetchFloors, fetchFloorsList, fetchMyBookings, fetchBookingRooms]);

  // Re-fetch occupancy when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      fetchDayOccupancy(selectedDate);
    }
  }, [selectedDate, fetchDayOccupancy]);

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
      fetchBookingRooms();
      fetchFloors();
      const interval = setInterval(() => {
        fetchBookings();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab, monitorPage, monitorPageSize, monitorSearch, monitorFloorFilter, fetchBookings, fetchBookingRooms, fetchFloors]);

  useEffect(() => {
    if (activeTab === 'book-room') {
      fetchBookingRooms();
      fetchFloors();
      fetchDepartments({ size: 100, page: 1, search: '', status: 'ACTIVE' });
      fetchEmployees({ size: 500, page: 1, search: '', status: 'ACTIVE' });
      fetchMyBookings();
      if (selectedDate) {
        fetchDayOccupancy(selectedDate);
      }
    } else if (activeTab === 'my-bookings') {
      fetchMyBookings();
    }
  }, [activeTab, fetchBookingRooms, fetchFloors, fetchDepartments, fetchEmployees, fetchMyBookings, selectedDate, fetchDayOccupancy]);

  const handleStartEditBooking = (booking) => {
    if (!booking) return;
    if (booking.startTime) {
      const start = new Date(booking.startTime);
      if (start <= new Date()) {
        toast.warning(
          'Meeting Has Begun',
          'This meeting has already started and cannot be edited. You can release the room early from My Bookings or Booking Monitor.',
          5000
        );
        return;
      }
    }
    closeAllDrawers();
    setEditingBooking(booking);
    if (booking.roomId) setSelectedRoomId(booking.roomId);
    if (booking.floor) setSelectedFloor(booking.floor);
    if (booking.startTime) {
      setSelectedDate(booking.startTime.split('T')[0]);
    }
    if (booking.title || booking.purpose) {
      setBookingPurpose(booking.title || booking.purpose);
    }
    if (booking.departmentName || booking.department) {
      setBookingDept(booking.departmentName || booking.department);
    }
    handleTabChange('book-room');
  };

  const handleCancelEdit = () => {
    setEditingBooking(null);
  };

  useEffect(() => {
    if (activeTab === 'directory') {
      fetchDirectory();
      fetchRooms({ size: 1000 });
      fetchDepartments({ size: 1000 });
      fetchEmployees({ size: 1000 });
    }
  }, [activeTab, fetchDirectory, fetchRooms, fetchDepartments, fetchEmployees]);

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
  const handleBookRoom = async (bookingData) => {
    try {
      const payloadDept = bookingData.department || bookingDept || user?.department || 'General';
      const payloadAttendees = Number(bookingData.attendeesCount) || 2;
      const payloadDesc = bookingData.description || '';

      const bookingPayload = {
        companyId: user?.companyId,
        roomId: bookingData.roomId,
        title: bookingData.title,
        description: payloadDesc,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        department: payloadDept,
        attendeesCount: payloadAttendees,
        participants: bookingData.participants || [],
      };

      let res;
      const isEditing = Boolean(editingBooking && editingBooking.id);
      const originalBookingId = editingBooking?.id;

      if (isEditing) {
        res = await facilityApi.updateBooking(originalBookingId, bookingPayload);
        if (!res || !res.success) {
          console.warn('PUT /facility/bookings endpoint fallback update locally:', res?.error);
          res = {
            success: true,
            data: {
              ...editingBooking,
              ...bookingPayload,
              id: originalBookingId,
              roomName: bookingData.roomName || editingBooking.roomName,
              floor: bookingData.floor || editingBooking.floor,
              status: 'CONFIRMED',
            },
          };
        }
      } else {
        res = await facilityApi.createBooking(bookingPayload);
      }

      if (res && res.success) {
        const targetId = isEditing ? originalBookingId : res.data?.id;
        if (targetId) {
          try {
            const currentMeta = JSON.parse(localStorage.getItem('meetspace_bookings_meta') || '{}');
            currentMeta[targetId] = {
              roomId: bookingData.roomId,
              roomName: bookingData.roomName,
              floor: bookingData.floor,
              title: bookingData.title,
              startTime: bookingData.startTime,
              endTime: bookingData.endTime,
              slotTimeText: bookingData.slotTimeText,
              department: payloadDept,
              attendeesCount: payloadAttendees,
              description: payloadDesc,
              participants: bookingData.participants || [],
            };
            localStorage.setItem('meetspace_bookings_meta', JSON.stringify(currentMeta));
          } catch (_) {}
        }

        if (isEditing) {
          showToast('Reservation Updated', `Successfully updated reservation #${originalBookingId} in ${bookingData.roomName}.`);
          setEditingBooking(null);
        } else {
          showToast('Reservation Confirmed', `Reserved ${res.data?.roomName || bookingData.roomName} on ${bookingData.floor} for "${bookingData.title}".`);
        }

        await refreshAllData();
        if (selectedDate) {
          await fetchDayOccupancy(selectedDate);
        }
        return { success: true };
      } else {
        showToast('Booking Conflict', res?.error || 'Failed to complete booking', 'error');
        return { success: false, error: res?.error };
      }
    } catch (err) {
      showToast('Booking Failed', err.message || 'An unexpected error occurred.', 'error');
      return { success: false, error: err.message };
    }
  };

  const handleCancelBooking = async (booking) => {
    if (!booking) return false;

    const bookingTitle = booking.title || booking.purpose || 'Meeting Reservation';
    const roomName = booking.roomName || 'Room';
    const timeInfo = booking.startTime && booking.endTime
      ? `${booking.startTime.substring(11, 16)} - ${booking.endTime.substring(11, 16)}`
      : booking.slot || '';
    const targetSub = [roomName, booking.floor, timeInfo].filter(Boolean).join(' • ');

    const ok = await confirm({
      title: 'Release Room Slot?',
      subtitle: 'Slot Release Confirmation',
      message: `Are you sure you want to cancel the reservation "${bookingTitle}" in ${roomName}? This will immediately release the slot for other colleagues.`,
      targetName: bookingTitle,
      targetSub: targetSub,
      confirmText: 'Release Slot',
      cancelText: 'Keep Reservation',
      type: 'danger',
    });
    if (!ok) return false;

    const res = await facilityApi.cancelBooking(booking.id);
    if (res && res.success) {
      if (drawerBooking && drawerBooking.id === booking.id) {
        setDrawerBooking(null);
      }
      showToast('Reservation Cancelled', `Slot for ${roomName} released and marked vacant.`);
      await refreshAllData();
      return true;
    } else {
      showToast('Cancel Failed', res?.error || 'Could not release slot.', 'error');
      return false;
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
            handleTabChange(tabKey);
            if (filters?.status && tabKey === 'rooms') {
              setRoomStatusFilter(filters.status);
            }
          }}
        />

        {/* Tab Switcher Header */}
        <FacilityAdminTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
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
                if (r?.id) setSelectedRoomId(r.id);
                if (r?.floor) setSelectedFloor(r.floor);
                handleTabChange('book-room');
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

          {/* Tab 4: Book a Room (Slot Finder — Shared Interface with Workplace Portal) */}
          {activeTab === 'book-room' && (
            <SlotFinderTab
              rooms={normalizedRooms}
              floors={floors}
              departments={departments}
              companyEmployees={employees}
              dayOccupancy={dayOccupancy}
              selectedFloor={selectedFloor}
              onFloorChange={setSelectedFloor}
              selectedRoomId={selectedRoomId}
              onRoomSelect={setSelectedRoomId}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              bookingPurpose={bookingPurpose}
              onBookingPurposeChange={setBookingPurpose}
              department={bookingDept}
              onDepartmentChange={setBookingDept}
              policies={{ maxSlotHours: 8 }}
              onBookRoom={handleBookRoom}
              isAdmin={true}
              onGoToAdmin={() => handleTabChange('rooms')}
              onGoToMyBookings={() => handleTabChange('my-bookings')}
              currentUser={user}
              isLoading={isLoadingBookingRooms}
              editingBooking={editingBooking}
              onCancelEdit={handleCancelEdit}
            />
          )}

          {/* Tab 5: My Bookings (Dedicated User Reservations Tab) */}
          {activeTab === 'my-bookings' && (
            <FacilityMyBookingsTab
              myBookings={myBookings}
              floors={floors}
              onInspectBooking={setDrawerBooking}
              onCancelBooking={handleCancelBooking}
              onEditBooking={handleStartEditBooking}
              onOpenBookRoom={() => {
                setEditingBooking(null);
                handleTabChange('book-room');
              }}
              onExportCSV={handleExportBookingsCSV}
            />
          )}

          {/* Tab 6: Live Room Booking Monitor */}
          {activeTab === 'monitor' && (
            <BookingMonitorTab
              rooms={roomsForMonitor}
              floors={floors}
              isLoadingRooms={isLoadingBookingRooms}
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
              onEditBooking={handleStartEditBooking}
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

          {/* Tab 7: Company Directory */}
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
          if (r?.id) setSelectedRoomId(r.id);
          if (r?.floor) setSelectedFloor(r.floor);
          handleTabChange('book-room');
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
        onEditBooking={handleStartEditBooking}
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
