import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Building, Users } from 'lucide-react';
import './Contact.css';

function Contact() {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Client inquiry submitted:', formData);
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
    }, 5000);
  };

  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="contact__wrapper">
          {/* Left Side: Contact Information & Value Promise */}
          <div className="contact__info">
            <span className="section-tag section-tag--light">Client Connections</span>
            <h2 className="contact__title">
              Connect With Our Workplace Team
            </h2>
            <p className="contact__subtitle">
              Interested in deploying our physical room management and smart slot suggestion system for your company's offices?
              Or have technical and setup inquiries? Connect with us directly.
            </p>

            <div className="contact__details">
              <div className="contact__detail">
                <Mail size={20} />
                <div>
                  <span className="contact__detail-label">Client Solutions Email</span>
                  <span className="contact__detail-value">inquiries@roombook.io</span>
                </div>
              </div>
              <div className="contact__detail">
                <Phone size={20} />
                <div>
                  <span className="contact__detail-label">Direct Phone Line</span>
                  <span className="contact__detail-value">+1 (555) 234-5678</span>
                </div>
              </div>
              <div className="contact__detail">
                <MapPin size={20} />
                <div>
                  <span className="contact__detail-label">Headquarters</span>
                  <span className="contact__detail-value">123 Workplace Plaza, Suite 400</span>
                </div>
              </div>
            </div>

            <div className="contact__guarantee-box">
              <h4>Why Companies Partner With Us:</h4>
              <ul>
                <li>✓ Tailored for physical room inventory, floors & meeting spaces</li>
                <li>✓ Zero double-booking guarantee with anti-overlap engine</li>
                <li>✓ Automated next-opening & alternative room suggestions</li>
                <li>✓ Dedicated onboarding and facilities assistance</li>
              </ul>
            </div>
          </div>

          {/* Right Side: Client Inquiry Form */}
          <form className="contact__form" onSubmit={handleSubmit}>
            {submitted ? (
              <div className="contact__success">
                <CheckCircle size={48} />
                <h3>Thank You for Connecting!</h3>
                <p>We've received your message. Our solutions specialist will reach out to you within 24 hours.</p>
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
                      placeholder="jane@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="company">Company / Organization *</label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Acme Corporation"
                      value={formData.company}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="inquiryType">How Can We Help? *</label>
                    <select
                      id="inquiryType"
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

                  <div className="form-group">
                    <label htmlFor="roomCount">Approximate Physical Rooms</label>
                    <select
                      id="roomCount"
                      name="roomCount"
                      value={formData.roomCount}
                      onChange={handleChange}
                    >
                      <option value="1 - 5 Rooms">1 - 5 Rooms</option>
                      <option value="6 - 15 Rooms">6 - 15 Rooms</option>
                      <option value="16 - 50 Rooms">16 - 50 Rooms</option>
                      <option value="50+ Rooms">50+ Rooms (Multi-Floor/Multi-Office)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Your Requirements or Questions *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    placeholder="Tell us about your company's physical office rooms, scheduling challenges, or any questions..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn btn--primary btn--full">
                  <Send size={18} />
                  Send Inquiry to Our Team
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
