import React from 'react';
import { CheckCircle, Send, DoorOpen, Tag } from 'lucide-react';
import Select from '../../common/Select/Select';

export default function HelpdeskTab({
  rooms,
  helpdeskForm,
  onFormChange,
  helpdeskSubmitted,
  onSubmit,
}) {
  return (
    <div className="portal-card helpdesk-panel">
      <div className="panel-header">
        <div>
          <h3>Facility Operations & Hardware Helpdesk</h3>
          <p>Report faulty displays, video conference issues, or request special room configurations.</p>
        </div>
        <span className="counter-pill">Internal Ops Desk • Ext. 4004</span>
      </div>

      {helpdeskSubmitted ? (
        <div className="helpdesk-success">
          <CheckCircle size={44} />
          <h4>Ticket Submitted to Workplace Operations</h4>
          <p>A facilities technician has been dispatched to check the physical room hardware.</p>
        </div>
      ) : (
        <form className="helpdesk-form" onSubmit={onSubmit}>
          <div className="form-row">
            <Select
              id="hd-room"
              label="Target Physical Room *"
              icon={<DoorOpen size={14} />}
              value={helpdeskForm.roomName}
              onChange={(val) => onFormChange({ ...helpdeskForm, roomName: val })}
              options={rooms.map((r) => ({
                value: r.name,
                label: `${r.name} (${r.code} • ${r.wing})`,
              }))}
              placeholder={rooms.length === 0 ? '-- No rooms available --' : '-- Select Room --'}
              required
            />

            <Select
              id="hd-cat"
              label="Issue Category *"
              icon={<Tag size={14} />}
              value={helpdeskForm.category}
              onChange={(val) => onFormChange({ ...helpdeskForm, category: val })}
              options={[
                { value: 'Hardware Issue', label: 'Faulty Display / VC Camera' },
                { value: 'Cables Missing', label: 'HDMI / USB-C Cables Missing' },
                { value: 'Booking Collision', label: 'Physical Room Collision' },
                { value: 'Room Temperature', label: 'HVAC / Temperature Issue' },
                { value: 'Supplies', label: 'Markers / Cleaning Needed' },
              ]}
              placeholder={null}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="hd-msg">Issue Description & Details *</label>
            <textarea
              id="hd-msg"
              rows="4"
              placeholder="Describe the issue with the physical room or equipment..."
              value={helpdeskForm.message}
              onChange={(e) => onFormChange({ ...helpdeskForm, message: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn--primary btn--lg helpdesk-submit-btn">
            <Send size={16} /> Submit Facility Ticket
          </button>
        </form>
      )}
    </div>
  );
}
