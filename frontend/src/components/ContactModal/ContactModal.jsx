import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Phone,
  Send,
  CheckCircle2,
  Building2,
  User,
  MessageSquare,
  ShieldCheck,
  Sparkles,
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
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="contact-modal__header">
          <div className="contact-modal__badge">
            <Sparkles size={13} />
            <span>Workplace Solutions</span>
          </div>
          <h3 className="contact-modal__title">Connect With Our Workplace Team</h3>
          <p className="contact-modal__subtitle">
            Interested in deploying our meeting room system for your company? We'd love to assist.
          </p>

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

        {/* Form Body */}
        {submitted ? (
          <div className="contact-modal__success">
            <CheckCircle2 size={44} />
            <h4>Thank You for Connecting!</h4>
            <p>Our corporate workplace specialist will reach out to you within 24 hours.</p>
          </div>
        ) : (
          <form className="contact-modal__form" onSubmit={handleSubmit}>
            <div className="contact-modal__grid">
              <div className="contact-modal__field">
                <label htmlFor="modal-name">
                  Full Name <span className="req">*</span>
                </label>
                <div className="modal-input-wrap">
                  <User size={15} className="modal-input-icon" />
                  <input
                    id="modal-name"
                    name="name"
                    type="text"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="contact-modal__field">
                <label htmlFor="modal-email">
                  Work Email <span className="req">*</span>
                </label>
                <div className="modal-input-wrap">
                  <Mail size={15} className="modal-input-icon" />
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

              <div className="contact-modal__field">
                <label htmlFor="modal-company">Company / Organization</label>
                <div className="modal-input-wrap">
                  <Building2 size={15} className="modal-input-icon" />
                  <input
                    id="modal-company"
                    name="company"
                    type="text"
                    placeholder="Acme Corporation"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="contact-modal__field">
                <label htmlFor="modal-phone">Mobile / Phone Number</label>
                <div className="modal-input-wrap">
                  <Phone size={15} className="modal-input-icon" />
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
            </div>

            <div className="contact-modal__field contact-modal__field--full">
              <label htmlFor="modal-message">How Can We Help?</label>
              <div className="modal-input-wrap">
                <MessageSquare size={15} className="modal-input-icon modal-input-icon--textarea" />
                <textarea
                  id="modal-message"
                  name="message"
                  rows="2"
                  placeholder="Tell us about your physical office spaces, requirements, or any questions..."
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="btn btn--primary btn--full modal-submit-btn">
              <Send size={15} />
              <span>Send Inquiry to Our Team</span>
            </button>

            <div className="contact-modal__reassurance">
              <ShieldCheck size={13} />
              <span>Your information is protected.</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
