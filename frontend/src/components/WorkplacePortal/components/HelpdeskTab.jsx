import React from 'react';
import { CheckCircle, Send } from 'lucide-react';

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
            <div className="form-group">
              <label htmlFor="hd-room">Target Physical Room *</label>
              <select
                id="hd-room"
                value={helpdeskForm.roomName}
                onChange={(e) => onFormChange({ ...helpdeskForm, roomName: e.target.value })}
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name} ({r.code} • {r.wing})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="hd-cat">Issue Category *</label>
              <select
                id="hd-cat"
                value={helpdeskForm.category}
                onChange={(e) => onFormChange({ ...helpdeskForm, category: e.target.value })}
              >
                <option value="Hardware Issue">Faulty Display / VC Camera</option>
                <option value="Cables Missing">HDMI / USB-C Cables Missing</option>
                <option value="Booking Collision">Physical Room Collision</option>
                <option value="Room Temperature">HVAC / Temperature Issue</option>
                <option value="Supplies">Markers / Cleaning Needed</option>
              </select>
            </div>
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

          <button type="submit" className="btn btn--primary btn--lg">
            <Send size={16} /> Submit Facility Ticket
          </button>
        </form>
      )}
    </div>
  );
}
