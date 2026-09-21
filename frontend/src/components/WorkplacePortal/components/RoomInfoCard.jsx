import React from 'react';
import {
  Building2,
  Users,
  MapPin,
  Tv,
  Video,
  Presentation,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

export default function RoomInfoCard({
  currentRoom,
  isMaintenance,
  isOccupied,
  selectedSlot,
  currentOccupant,
  nextAvailableSlot,
}) {
  if (!currentRoom) return null;

  // Equipment icon mapper
  const renderHardwareIcon = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('screen') || lower.includes('display') || lower.includes('tv')) {
      return <Tv size={15} />;
    }
    if (lower.includes('video') || lower.includes('conf') || lower.includes('cam')) {
      return <Video size={15} />;
    }
    if (lower.includes('whiteboard') || lower.includes('board')) {
      return <Presentation size={15} />;
    }
    return <Sparkles size={15} />;
  };

  const hardwareList = currentRoom.hardware || [
    { name: 'Screen Display' },
    { name: 'Video Conf' },
    ...(currentRoom.capacity >= 8 ? [{ name: 'Whiteboard' }] : []),
  ];

  return (
    <div className="room-info-card-wrapper">
      <span className="room-info-tag">
        <Info size={14} /> Room Details & Specifications
      </span>

      <div className="room-info-card">
        {/* Header with Room Identity */}
        <div className="room-info-card__header">
          <div className="room-info-card__header-left">
            <div className="room-info-card__meta-line">
              <span className="room-info-card__code-badge">{currentRoom.code || `RM-${currentRoom.id}`}</span>
              <span className="room-info-card__type">{currentRoom.type || 'Meeting Space'}</span>
            </div>
            <h3 className="room-info-card__title">{currentRoom.name}</h3>
          </div>
          <span
            className={`room-info-card__status-pill ${
              isMaintenance
                ? 'room-info-card__status-pill--maint'
                : isOccupied
                ? 'room-info-card__status-pill--busy'
                : 'room-info-card__status-pill--free'
            }`}
          >
            {isMaintenance ? (
              <>
                <Wrench size={13} /> Offline
              </>
            ) : isOccupied ? (
              <>
                <AlertTriangle size={13} /> Reserved
              </>
            ) : (
              <>
                <CheckCircle2 size={13} /> Available
              </>
            )}
          </span>
        </div>

        {/* Quick Specs Grid */}
        <div className="room-info-specs-grid">
          <div className="room-info-spec-item">
            <span className="room-info-spec-label">
              <Users size={13} /> Capacity
            </span>
            <strong className="room-info-spec-value">{currentRoom.capacity} People</strong>
          </div>
          <div className="room-info-spec-item">
            <span className="room-info-spec-label">
              <Building2 size={13} /> Floor
            </span>
            <strong className="room-info-spec-value">{currentRoom.floor || 'Floor 1'}</strong>
          </div>
          <div className="room-info-spec-item">
            <span className="room-info-spec-label">
              <MapPin size={13} /> Wing / Zone
            </span>
            <strong className="room-info-spec-value">{currentRoom.wing || 'Main Wing'}</strong>
          </div>
          <div className="room-info-spec-item">
            <span className="room-info-spec-label">
              <Clock size={13} /> Next Free
            </span>
            <strong className="room-info-spec-value room-info-spec-value--highlight">
              {isOccupied ? (nextAvailableSlot ? nextAvailableSlot.split(' - ')[0] : 'Later') : 'Available Now'}
            </strong>
          </div>
        </div>

        {/* Equipment & Amenities */}
        <div className="room-info-amenities">
          <span className="room-info-section-title">Amenities & Technology</span>
          <div className="room-info-amenity-pills">
            {hardwareList.map((hw, idx) => (
              <span key={idx} className="room-info-amenity-pill">
                {renderHardwareIcon(hw.name)}
                {hw.name}
              </span>
            ))}
            <span className="room-info-amenity-pill">
              <Sparkles size={13} /> High-Speed Wi-Fi
            </span>
            <span className="room-info-amenity-pill">
              <Sparkles size={13} /> Power Outlets
            </span>
          </div>
        </div>

        {/* Live Slot Summary */}
        <div className="room-info-summary-box">
          <div className="room-info-summary-row">
            <span className="room-info-summary-label">Target Slot:</span>
            <strong className="room-info-summary-value">{selectedSlot}</strong>
          </div>
          {isOccupied && currentOccupant && (
            <div className="room-info-summary-row room-info-summary-row--conflict">
              <span className="room-info-summary-label">Current:</span>
              <span className="room-info-summary-value" title={`${currentOccupant.team} — "${currentOccupant.purpose}"`}>
                {currentOccupant.team} — "{currentOccupant.purpose}"
              </span>
            </div>
          )}
          {!isOccupied && !isMaintenance && (
            <p className="room-info-guarantee">
              <CheckCircle2 size={14} /> Guaranteed conflict-free slot for {currentRoom.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
