import React from 'react';
import { Tablet } from 'lucide-react';

export default function DoorTabletPreview({
  currentRoom,
  isMaintenance,
  isOccupied,
  selectedSlot,
  currentOccupant,
  bookingPurpose,
  department,
  nextAvailableSlot,
}) {
  if (!currentRoom) return null;

  return (
    <div className="door-tablet-wrapper">
      <span className="door-tablet-tag">
        <Tablet size={14} /> Physical Room Door Display
      </span>
      <div
        className={`door-tablet ${
          isMaintenance
            ? 'door-tablet--maintenance'
            : isOccupied
            ? 'door-tablet--occupied'
            : 'door-tablet--available'
        }`}
      >
        <div className="tablet-header">
          <span className="tablet-code">{currentRoom?.code || 'RM'}</span>
          <h4 className="tablet-room">{currentRoom?.name || 'Conference Space'}</h4>
          <span className="tablet-loc">{currentRoom?.wing || currentRoom?.floor || ''}</span>
        </div>

        <div className="tablet-status-strip">
          <span className="tablet-badge">
            {isMaintenance ? 'MAINTENANCE' : isOccupied ? 'OCCUPIED' : 'VACANT'}
          </span>
          <div className="tablet-slot">
            {isMaintenance ? 'Room Offline' : isOccupied ? selectedSlot : 'Ready for Booking'}
          </div>
        </div>

        <div className="tablet-info">
          {isMaintenance ? (
            <p>Facilities equipment maintenance in progress.</p>
          ) : isOccupied ? (
            <>
              <p>
                <strong>Team:</strong> {currentOccupant?.team || department}
              </p>
              <p>
                <strong>Purpose:</strong> "{currentOccupant?.purpose || bookingPurpose}"
              </p>
            </>
          ) : (
            <p className="tablet-free-msg">Tap door screen or web console to reserve.</p>
          )}
        </div>

        <div className="tablet-footer">
          <span>Next Open Window:</span>
          <strong>{nextAvailableSlot || currentRoom?.nextAvailableSlot || 'Ready Now'}</strong>
        </div>
      </div>
    </div>
  );
}
