import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { INITIAL_ROOMS } from './data/workplaceData';
import WorkplaceTabs from './components/WorkplaceTabs';
import SlotFinderTab from './components/SlotFinderTab';
import CampusDirectoryTab from './components/CampusDirectoryTab';
import MyBookingsTab from './components/MyBookingsTab';
import FacilityAdminTab from './components/FacilityAdminTab';
import HelpdeskTab from './components/HelpdeskTab';
import { formatDate } from '../../utils/dateUtils';
import './WorkplacePortal.css';

export default function WorkplacePortal() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'COMPANY_ADMIN';

  const [activeTab, setActiveTab] = useState('slot-finder'); // 'slot-finder' | 'directory' | 'my-bookings' | 'admin-console' | 'helpdesk'
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [selectedFloor, setSelectedFloor] = useState('All Floors');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM - 11:00 AM');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [department, setDepartment] = useState('');

  // Directory filter state
  const [dirFloorFilter, setDirFloorFilter] = useState('all');
  const [dirSizeFilter, setDirSizeFilter] = useState('all');

  // Policies (Admin-managed)
  const [policies, setPolicies] = useState({
    maxSlotHours: 2,
    advanceBookingDays: 14,
  });

  // Helpdesk form state
  const [helpdeskForm, setHelpdeskForm] = useState({
    roomName: '',
    category: 'Hardware Issue',
    message: '',
  });
  const [helpdeskSubmitted, setHelpdeskSubmitted] = useState(false);

  // Active reservations
  const [myBookings, setMyBookings] = useState([]);
  const { toast } = useToast();

  // Current active room for slot finder
  const filteredRooms = rooms.filter(
    (r) => selectedFloor === 'All Floors' || r.floor === selectedFloor
  );
  const currentRoom =
    rooms.find((r) => r.id === selectedRoomId) || filteredRooms[0] || rooms[0] || null;

  const isMaintenance = currentRoom?.isUnderMaintenance || false;
  const isOccupied = !isMaintenance && (currentRoom?.occupiedSlots || []).includes(selectedSlot);
  const currentOccupant = currentRoom?.occupiedDetails?.[selectedSlot];

  // Alternative rooms free during this slot
  const alternativeRooms = currentRoom
    ? rooms.filter(
        (r) =>
          r.id !== currentRoom.id &&
          !r.isUnderMaintenance &&
          !r.occupiedSlots.includes(selectedSlot)
      )
    : [];

  const handleBookRoom = (roomId, roomName, slotTime, floorName) => {
    const newBooking = {
      id: 'b-' + Date.now(),
      roomName,
      roomId,
      floor: floorName || currentRoom.wing,
      date: selectedDate,
      slot: slotTime,
      purpose: bookingPurpose || 'Internal Meeting',
      department: department || 'General Team',
    };

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            occupiedSlots: [...r.occupiedSlots, slotTime],
            occupiedDetails: {
              ...r.occupiedDetails,
              [slotTime]: { team: department, purpose: bookingPurpose },
            },
          };
        }
        return r;
      })
    );

    setMyBookings((prev) => [newBooking, ...prev]);

    toast.success(
      'Slot Successfully Booked!',
      `${roomName} reserved for ${slotTime} on ${formatDate(selectedDate)} ("${newBooking.purpose}"). Door tablet updated.`,
      5000
    );
  };

  const handleCancelBooking = (booking) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === booking.roomId) {
          const updated = { ...r.occupiedDetails };
          delete updated[booking.slot];
          return {
            ...r,
            occupiedSlots: r.occupiedSlots.filter((s) => s !== booking.slot),
            occupiedDetails: updated,
          };
        }
        return r;
      })
    );

    setMyBookings((prev) => prev.filter((b) => b.id !== booking.id));

    toast.info(
      'Slot Released',
      `Reservation for ${booking.roomName} (${booking.slot}) has been cancelled and is now vacant for colleagues.`
    );
  };

  const handleToggleMaintenance = (roomId) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) return;

    const nextVal = !targetRoom.isUnderMaintenance;

    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, isUnderMaintenance: nextVal } : r))
    );

    if (nextVal) {
      toast.warning(
        'Room Set to Maintenance',
        `${targetRoom.name} is now temporarily offline for maintenance.`
      );
    } else {
      toast.info(
        'Room Maintenance Cleared',
        `${targetRoom.name} is now available for booking.`
      );
    }
  };

  const handleHelpdeskSubmit = (e) => {
    e.preventDefault();
    setHelpdeskSubmitted(true);
    setTimeout(() => {
      setHelpdeskSubmitted(false);
      setHelpdeskForm({ roomName: rooms[0]?.name || '', category: 'Hardware Issue', message: '' });
    }, 4000);
  };

  const filteredDirectoryRooms = rooms.filter((room) => {
    const matchesFloor = dirFloorFilter === 'all' || room.floorCategory === dirFloorFilter;
    const matchesSize = dirSizeFilter === 'all' || room.sizeCategory === dirSizeFilter;
    return matchesFloor && matchesSize;
  });

  return (
    <div className="workplace-portal">
      <div className="container">
        {/* Navigation Tabs Header */}
        <WorkplaceTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          bookingsCount={myBookings.length}
          isAdmin={isAdmin}
        />

        {/* Tab 1: Book a Slot */}
        {activeTab === 'slot-finder' && (
          <SlotFinderTab
            rooms={rooms}
            filteredRooms={filteredRooms}
            currentRoom={currentRoom}
            selectedFloor={selectedFloor}
            onFloorChange={(val) => {
              setSelectedFloor(val);
              const firstInFloor = rooms.find(
                (r) => val === 'All Floors' || r.floor === val
              );
              if (firstInFloor) setSelectedRoomId(firstInFloor.id);
            }}
            selectedRoomId={selectedRoomId}
            onRoomSelect={setSelectedRoomId}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedSlot={selectedSlot}
            onSlotChange={setSelectedSlot}
            bookingPurpose={bookingPurpose}
            onBookingPurposeChange={setBookingPurpose}
            department={department}
            onDepartmentChange={setDepartment}
            isMaintenance={isMaintenance}
            isOccupied={isOccupied}
            currentOccupant={currentOccupant}
            alternativeRooms={alternativeRooms}
            policies={policies}
            onBookRoom={handleBookRoom}
            isAdmin={isAdmin}
            onGoToAdmin={() => setActiveTab('admin-console')}
          />
        )}

        {/* Tab 2: Campus Room Directory */}
        {activeTab === 'directory' && (
          <CampusDirectoryTab
            rooms={rooms}
            filteredDirectoryRooms={filteredDirectoryRooms}
            dirFloorFilter={dirFloorFilter}
            onFloorFilterChange={setDirFloorFilter}
            dirSizeFilter={dirSizeFilter}
            onSizeFilterChange={setDirSizeFilter}
            selectedSlot={selectedSlot}
            onSelectRoomForBooking={(roomId) => {
              setSelectedRoomId(roomId);
              setActiveTab('slot-finder');
            }}
          />
        )}

        {/* Tab 3: My Scheduled Slots */}
        {activeTab === 'my-bookings' && (
          <MyBookingsTab
            myBookings={myBookings}
            onCancelBooking={handleCancelBooking}
            onGoToSlotFinder={() => setActiveTab('slot-finder')}
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
