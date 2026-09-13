import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Phone,
  Send,
  CheckCircle2,
  Building2,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './ContactModal.css';

export default function ContactModal() {
  const { isConnectOpen, closeConnect } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    inquiryType: 'Deploy Room Management',
    roomCount: '6 - 15 Rooms',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isConnectOpen) {
        closeConnect();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConnectOpen, closeConnect]);

  if (!isConnectOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        inquiryType: 'Deploy Room Management',
        roomCount: '6 - 15 Rooms',
        message: '',
      });
      closeConnect();
    }, 2500);
  };

  return (
    <div className="contact-modal-overlay" onClick={closeConnect}>
      <div
        className="contact-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          className="contact-modal__close"
          onClick={closeConnect}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="contact-modal__header">
          <div className="contact-modal__top-bar">
            <div className="contact-modal__logo">
              <Building2 size={20} />
              <span>Workplace Solutions</span>
            </div>
            <div className="contact-modal__channels">
              <a href="mailto:inquiries@roombook.io" className="modal-channel-item">
                <Mail size={13} />
                <span>inquiries@roombook.io</span>
              </a>
              <span className="channel-sep">•</span>
              <a href="tel:+15552345678" className="modal-channel-item">
                <Phone size={13} />
                <span>+1 (555) 234-5678</span>
              </a>
            </div>
          </div>
          <h3 className="contact-modal__title">Connect With Our Workplace Team</h3>
          <p className="contact-modal__subtitle">
            Schedule an enterprise walkthrough or discuss physical room setup for your company.
          </p>
        </div>

        {/* Form Body */}
        {submitted ? (
          <div className="contact-modal__success">
            <CheckCircle2 size={48} />
            <h4>Thank You for Connecting!</h4>
            <p>Our corporate workplace specialist will reach out to you within 24 hours.</p>
          </div>
        ) : (
          <form className="contact-modal__form" onSubmit={handleSubmit}>
            <div className="contact-modal__row">
              <div className="contact-modal__group">
                <label htmlFor="modal-name">Your Full Name *</label>
                <input
                  id="modal-name"
                  name="name"
                  type="text"
                  placeholder="Jane Smith"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="contact-modal__group">
                <label htmlFor="modal-email">Work Email *</label>
                <input
                  id="modal-email"
                  name="email"
                  type="email"
                  placeholder="jane@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="contact-modal__row">
              <div className="contact-modal__group">
                <label htmlFor="modal-company">Company / Organization *</label>
                <input
                  id="modal-company"
                  name="company"
                  type="text"
                  placeholder="Acme Corp"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="contact-modal__group">
                <label htmlFor="modal-phone">Phone Number</label>
                <input
                  id="modal-phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="contact-modal__row">
              <div className="contact-modal__group">
                <label htmlFor="modal-inquiryType">Inquiry Type</label>
                <select
                  id="modal-inquiryType"
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={handleChange}
                >
                  <option value="Deploy Room Management">Deploy System for My Company</option>
                  <option value="Schedule Demo">Schedule a Live System Walkthrough</option>
                  <option value="Custom Setup">Custom Room Setup & Configuration</option>
                  <option value="Client Support">Existing Client Technical Support</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>
              <div className="contact-modal__group">
                <label htmlFor="modal-roomCount">Approximate Physical Rooms</label>
                <select
                  id="modal-roomCount"
                  name="roomCount"
                  value={formData.roomCount}
                  onChange={handleChange}
                >
                  <option value="1 - 5 Rooms">1 - 5 Rooms (Single Floor)</option>
                  <option value="6 - 15 Rooms">6 - 15 Rooms (Standard Office)</option>
                  <option value="16 - 50 Rooms">16 - 50 Rooms (Multi-Floor Campus)</option>
                  <option value="50+ Rooms">50+ Rooms (Enterprise)</option>
                </select>
              </div>
            </div>

            <div className="contact-modal__group">
              <label htmlFor="modal-message">Your Requirements or Questions *</label>
              <textarea
                id="modal-message"
                name="message"
                rows="3"
                placeholder="Tell us about your physical office rooms, scheduling challenges, or questions..."
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn--primary btn--full modal-submit-btn">
              <Send size={16} />
              Send Inquiry to Our Team
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
