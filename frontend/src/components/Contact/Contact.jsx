import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    requestType: 'Equipment Issue',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Facility request submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        department: '',
        requestType: 'Equipment Issue',
        message: '',
      });
    }, 4000);
  };

  return (
    <section className="contact" id="facility-support">
      <div className="container">
        <div className="contact__wrapper">
          {/* Left – Info */}
          <div className="contact__info">
            <span className="section-tag section-tag--light">Facility Support Desk</span>
            <h2 className="contact__title">
              Workplace & Room Operations Support
            </h2>
            <p className="contact__subtitle">
              Need assistance with room booking rules, reporting faulty displays or VC hardware,
              or requesting special room allocations for your department? Our workplace ops team is here to help.
            </p>
            <div className="contact__details">
              <div className="contact__detail">
                <Mail size={20} />
                <div>
                  <span className="contact__detail-label">Internal Ops Email</span>
                  <span className="contact__detail-value">facilities@company.internal</span>
                </div>
              </div>
              <div className="contact__detail">
                <Phone size={20} />
                <div>
                  <span className="contact__detail-label">Extension / Phone</span>
                  <span className="contact__detail-value">Ext. 4004 / +1 (555) 019-4004</span>
                </div>
              </div>
              <div className="contact__detail">
                <MapPin size={20} />
                <div>
                  <span className="contact__detail-label">Physical Ops Desk</span>
                  <span className="contact__detail-value">Building A, Floor 1 (Ops Hub)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right – Form */}
          <form className="contact__form" onSubmit={handleSubmit}>
            {submitted ? (
              <div className="contact__success">
                <CheckCircle size={48} />
                <h3>Request Submitted!</h3>
                <p>Your ticket has been logged with Workplace Facilities. A team member will inspect the room shortly.</p>
              </div>
            ) : (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Work Email *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="jane.doe@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="department">Department / Floor *</label>
                    <input
                      id="department"
                      name="department"
                      type="text"
                      placeholder="Engineering • Floor 3"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="requestType">Request Type *</label>
                    <select
                      id="requestType"
                      name="requestType"
                      value={formData.requestType}
                      onChange={handleChange}
                    >
                      <option value="Equipment Issue">Faulty Display / VC Equipment</option>
                      <option value="Booking Conflict">Room Booking Conflict / Double-Booking</option>
                      <option value="Policy Override">Request Extended Duration Policy</option>
                      <option value="New Room Setup">Register / Configure New Physical Room</option>
                      <option value="General Inquiry">General Workplace Facility Question</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="message">Details & Room Name *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    placeholder="Specify the room name (e.g. Boardroom Alpha) and issue description..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn--primary btn--full">
                  <Send size={18} />
                  Submit Facility Ticket
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
