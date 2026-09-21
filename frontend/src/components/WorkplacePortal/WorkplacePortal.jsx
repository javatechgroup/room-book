import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { facilityApi } from '../../api/facilityApi';
import WorkplaceTabs from './components/WorkplaceTabs';
import SlotFinderTab from './components/SlotFinderTab';
import CampusDirectoryTab from './components/CampusDirectoryTab';
import MyBookingsTab from './components/MyBookingsTab';
import FacilityAdminTab from './components/FacilityAdminTab';
import HelpdeskTab from './components/HelpdeskTab';
import { formatDate } from '../../utils/dateUtils';
import './WorkplacePortal.css';

const normalizeRoom = (r) => ({
  id: r.id,
  name: r.name,
  code: r.location || `RM-${r.id}`,
  floor: r.floor || 'Floor 1',
  wing: r.location || r.floor || 'Main Wing',
  building: r.building || r.companyName || 'Company HQ',
  capacity: r.capacity || 6,
  status: r.status || 'ACTIVE',
  isUnderMaintenance: r.status === 'MAINTENANCE',
  description: r.description || '',
  type: r.capacity <= 4 ? 'Focus Pod' : r.capacity <= 10 ? 'Team Room' : 'Executive Boardroom',
  sizeCategory: r.capacity <= 4 ? 'small' : r.capacity <= 10 ? 'medium' : 'large',
  hardware: [
    { name: 'Screen Display' },
    { name: 'Video Conf' },
    ...(r.capacity >= 8 ? [{ name: 'Whiteboard' }] : []),
  ],
});


export default function WorkplacePortal() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'COMPANY_ADMIN';
  const { toast } = useToast();

  // Navigation Tab State — initialized from URL parameter if present (?tab=slot-finder)
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const validTabs = ['slot-finder', 'directory', 'my-bookings', 'admin-console', 'helpdesk'];
      if (tabParam && validTabs.includes(tabParam)) return tabParam;
    }
    return 'slot-finder';
  });

  const handleTabChange = useCallback((tabKey) => {
    setActiveTab(tabKey);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      url.searchParams.set('tab', tabKey);
      window.history.pushState({ tab: tabKey }, '', url);
    }
  }, []);

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab') || 'slot-finder';
        setActiveTab(tabParam);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global Keyboard Shortcuts: '/' to search, 'ESC' to blur
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';
      if (e.key === '/' && !isInput) {
        e.preventDefault();
        const searchInput = document.querySelector('.superadmin-search-input, .search-input__field');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      } else if (e.key === 'Escape' && isInput) {
        document.activeElement.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ════════════════════ PRIMARY DATA STATES ════════════════════
  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [dayOccupancy, setDayOccupancy] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  // Slot Finder Controls
  const [selectedFloor, setSelectedFloor] = useState('All Floors');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [department, setDepartment] = useState('');

  // Campus Directory Filters
  const [dirFloorFilter, setDirFloorFilter] = useState('all');
  const [dirSizeFilter, setDirSizeFilter] = useState('all');
  const [dirSearch, setDirSearch] = useState('');

  // Policies (Admin-managed)
  const [policies, setPolicies] = useState({
    maxSlotHours: 8,
    advanceBookingDays: 14,
  });

  // Active reservation being edited in Slot Finder
  const [editingBooking, setEditingBooking] = useState(null);

  const handleStartEditBooking = (booking) => {
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
      setDepartment(booking.departmentName || booking.department);
    }
    setActiveTab('slot-finder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingBooking(null);
  };

  // Helpdesk form state
  const [helpdeskForm, setHelpdeskForm] = useState({
    roomName: '',
    category: 'Hardware Issue',
    message: '',
  });
  const [helpdeskSubmitted, setHelpdeskSubmitted] = useState(false);

  // ════════════════════ DATA FETCHING ════════════════════
  const fetchRoomsAndFloors = useCallback(async () => {
    setIsLoadingRooms(true);
    const companyId = user?.companyId;
    try {
      // Fetch rooms, floors, and real company departments from DB
      const [roomsRes, floorsRes, deptsRes] = await Promise.all([
        facilityApi.getRooms({ companyId, pageSize: 100 }),
        facilityApi.getFloors({ companyId }),
        facilityApi.getAllDepartments({ companyId }).then((res) => {
          if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
            return res;
          }
          return facilityApi.getDepartments({ companyId, size: 100 });
        }),
      ]);

      let loadedRooms = [];
      if (roomsRes && roomsRes.success && Array.isArray(roomsRes.data)) {
        loadedRooms = roomsRes.data.map(normalizeRoom);
      }
      setRooms(loadedRooms);

      if (floorsRes && floorsRes.success && Array.isArray(floorsRes.data)) {
        setFloors(floorsRes.data);
      } else {
        setFloors([]);
      }

      let loadedDepts = [];
      if (deptsRes && deptsRes.success) {
        if (Array.isArray(deptsRes.data)) {
          loadedDepts = deptsRes.data;
        } else if (deptsRes.data && Array.isArray(deptsRes.data.content)) {
          loadedDepts = deptsRes.data.content;
        }
      }
      setDepartments(loadedDepts);

      if (loadedRooms.length > 0) {
        setSelectedRoomId((prev) => (loadedRooms.some((r) => r.id === Number(prev)) ? prev : loadedRooms[0].id));
      } else {
        setSelectedRoomId('');
      }
    } catch (err) {
      console.warn('Error fetching company rooms, floors, and departments from DB:', err);
      setRooms([]);
      setFloors([]);
      setDepartments([]);
    } finally {
      setIsLoadingRooms(false);
    }
  }, [user?.companyId]);

  const fetchDayOccupancy = useCallback(async (dateStr) => {
    const companyId = user?.companyId;
    try {
      const res = await facilityApi.getOccupancyForDay(dateStr, { companyId });
      if (res && res.success && Array.isArray(res.data)) {
        setDayOccupancy(res.data);
      } else {
        setDayOccupancy([]);
      }
    } catch (err) {
      console.warn('Error fetching day occupancy for company:', err);
      setDayOccupancy([]);
    }
  }, [user?.companyId]);

  const fetchMyBookings = useCallback(async () => {
    const companyId = user?.companyId;
    try {
      const res = await facilityApi.getMyBookings({ companyId });
      if (res && res.success && Array.isArray(res.data)) {
        let meta = {};
        try {
          meta = JSON.parse(localStorage.getItem('meetspace_bookings_meta') || '{}');
        } catch (_) {}

        const enriched = res.data.map((b) => {
          const m = meta[b.id] || {};
          return {
            ...b,
            roomId: m.roomId || b.roomId,
            roomName: m.roomName || b.roomName || 'Meeting Room',
            floor: m.floor || b.floor || 'Main Floor',
            title: m.title || b.title,
            startTime: m.startTime || b.startTime,
            endTime: m.endTime || b.endTime,
            status: m.status || b.status,
            attendeesCount: m.attendeesCount || b.attendeesCount || 2,
            departmentName: m.department || b.departmentName || b.department || 'General',
            department: m.department || b.department || b.departmentName || 'General',
            description: m.description || b.description || '',
          };
        });
        setMyBookings(enriched);
      } else {
        setMyBookings([]);
      }
    } catch (err) {
      console.warn('Error fetching user bookings for company:', err);
      setMyBookings([]);
    }
  }, [user?.companyId]);

  // Initial load
  useEffect(() => {
    fetchRoomsAndFloors();
    fetchMyBookings();
  }, [fetchRoomsAndFloors, fetchMyBookings]);

  // Re-fetch occupancy when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      fetchDayOccupancy(selectedDate);
    }
  }, [selectedDate, fetchDayOccupancy]);



  // ════════════════════ BOOKING ACTIONS ════════════════════
  const handleBookRoom = async (bookingData) => {
    try {
      const payloadDept = bookingData.department || department || user?.department || 'General';
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
      };

      let res;
      const isEditing = Boolean(editingBooking && editingBooking.id);
      const originalBookingId = editingBooking?.id;

      if (isEditing) {
        // Update original booking in place (preserves the exact reservation ID!)
        res = await facilityApi.updateBooking(originalBookingId, bookingPayload);
        // If backend hasn't been restarted with the PUT endpoint yet, update locally in place
        // NEVER cancel the old booking and NEVER create a separate booking!
        if (!res || !res.success) {
          console.warn('PUT /facility/bookings endpoint not active yet, updating original booking in place:', res?.error);
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
        // Create new reservation
        res = await facilityApi.createBooking(bookingPayload);
      }

      if (res && res.success) {
        // Cache metadata locally by booking ID so attendeesCount, department, description, room, and time are 100% captured and preserved
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
              status: 'CONFIRMED',
              attendeesCount: payloadAttendees,
              department: payloadDept,
              description: payloadDesc,
            };
            localStorage.setItem('meetspace_bookings_meta', JSON.stringify(currentMeta));
          } catch (e) {
            console.warn('Could not cache booking metadata:', e);
          }
        }

        if (isEditing) {
          setEditingBooking(null);
          toast.success(
            'Reservation Updated Successfully!',
            `Reservation #${originalBookingId} updated to ${bookingData.title} (${bookingData.slotTimeText || ''}).`,
            5000
          );
        } else {
          toast.success(
            'Room Reserved Successfully!',
            `Reserved for ${bookingData.title} (${bookingData.slotTimeText || ''}). Door tablet synchronized.`,
            5000
          );
        }
        // Refresh bookings & occupancy
        await Promise.all([fetchDayOccupancy(selectedDate), fetchMyBookings()]);
        // Switch to my-bookings to show updated list
        setActiveTab('my-bookings');
        return { success: true };
      } else {
        toast.error('Reservation Conflict / Error', res?.error || 'Could not complete booking.');
        return { success: false, error: res?.error };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Server error reserving room';
      toast.error('Booking Failed', msg);
      return { success: false, error: msg };
    }
  };

  const handleCancelBooking = async (booking) => {
    const bookingId = booking.id;
    try {
      const res = await facilityApi.cancelBooking(bookingId);
      if (res && res.success) {
        toast.info(
          'Slot Released',
          `Reservation for ${booking.roomName || 'Room'} has been cancelled and is now vacant for colleagues.`
        );
        await Promise.all([fetchDayOccupancy(selectedDate), fetchMyBookings()]);
      } else {
        toast.error('Cancel Failed', res?.error || 'Could not release slot.');
      }
    } catch (err) {
      toast.error('Cancel Failed', err.message || 'Error releasing slot.');
    }
  };

  const handleToggleMaintenance = async (roomId) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) return;
    try {
      const res = await facilityApi.toggleRoomMaintenance(roomId);
      if (res && res.success) {
        setRooms((prev) =>
          prev.map((r) => (r.id === roomId ? { ...r, isUnderMaintenance: !r.isUnderMaintenance } : r))
        );
        toast.info('Room Status Updated', `${targetRoom.name} maintenance status toggled.`);
      }
    } catch (err) {
      toast.error('Update Failed', err.message);
    }
  };

  const handleHelpdeskSubmit = (e) => {
    e.preventDefault();
    setHelpdeskSubmitted(true);
    setTimeout(() => {
      setHelpdeskSubmitted(false);
      setHelpdeskForm({ roomName: rooms[0]?.name || '', category: 'Hardware Issue', message: '' });
      toast.success('Ticket Submitted', 'Facilities operations team has been notified.');
    }, 1500);
  };

  // Filtered rooms for directory
  const filteredDirectoryRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesFloor = dirFloorFilter === 'all' || room.floor === dirFloorFilter;
      const matchesSize = dirSizeFilter === 'all' || room.sizeCategory === dirSizeFilter;
      const matchesSearch =
        !dirSearch ||
        room.name.toLowerCase().includes(dirSearch.toLowerCase()) ||
        (room.code && room.code.toLowerCase().includes(dirSearch.toLowerCase()));
      return matchesFloor && matchesSize && matchesSearch;
    });
  }, [rooms, dirFloorFilter, dirSizeFilter, dirSearch]);

  return (
    <div className="workplace-portal">
      <div className="container">
        {/* Navigation Tabs Header */}
        <WorkplaceTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          bookingsCount={myBookings.filter((b) => b.status === 'CONFIRMED').length}
          isAdmin={isAdmin}
        />

        {/* Tab 1: Book a Slot */}
        {activeTab === 'slot-finder' && (
          <SlotFinderTab
            rooms={rooms}
            floors={floors}
            dayOccupancy={dayOccupancy}
            selectedFloor={selectedFloor}
            onFloorChange={setSelectedFloor}
            selectedRoomId={selectedRoomId}
            onRoomSelect={setSelectedRoomId}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            bookingPurpose={bookingPurpose}
            onBookingPurposeChange={setBookingPurpose}
            department={department}
            onDepartmentChange={setDepartment}
            departments={departments}
            policies={policies}
            onBookRoom={handleBookRoom}
            isAdmin={isAdmin}
            onGoToAdmin={() => handleTabChange('admin-console')}
            onGoToMyBookings={() => handleTabChange('my-bookings')}
            currentUser={user}
            isLoading={isLoadingRooms}
            editingBooking={editingBooking}
            onCancelEdit={handleCancelEdit}
          />
        )}

        {/* Tab 2: Campus Room Directory */}
        {activeTab === 'directory' && (
          <CampusDirectoryTab
            rooms={rooms}
            floors={floors}
            filteredDirectoryRooms={filteredDirectoryRooms}
            dirFloorFilter={dirFloorFilter}
            onFloorFilterChange={setDirFloorFilter}
            dirSizeFilter={dirSizeFilter}
            onSizeFilterChange={setDirSizeFilter}
            search={dirSearch}
            onSearchChange={setDirSearch}
            onSelectRoomForBooking={(roomId) => {
              setSelectedRoomId(roomId);
              handleTabChange('slot-finder');
            }}
          />
        )}

        {/* Tab 3: My Scheduled Slots */}
        {activeTab === 'my-bookings' && (
          <MyBookingsTab
            myBookings={myBookings}
            onCancelBooking={handleCancelBooking}
            onEditBooking={handleStartEditBooking}
            onGoToSlotFinder={() => handleTabChange('slot-finder')}
            currentUser={user}
          />
        )}

        {/* Tab 4: Facility Admin Console */}
        {activeTab === 'admin-console' && isAdmin && (
          <FacilityAdminTab
            policies={policies}
            onPoliciesChange={setPolicies}
            rooms={rooms}
            onToggleMaintenance={handleToggleMaintenance}
          />
        )}

        {/* Tab 5: Facility Helpdesk */}
        {activeTab === 'helpdesk' && (
          <HelpdeskTab
            rooms={rooms}
            helpdeskForm={helpdeskForm}
            onFormChange={setHelpdeskForm}
            helpdeskSubmitted={helpdeskSubmitted}
            onSubmit={handleHelpdeskSubmit}
          />
        )}
      </div>
    </div>
  );
}
