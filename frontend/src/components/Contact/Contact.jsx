import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: integrate with backend API
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', company: '', phone: '', message: '' });
    }, 4000);
  };

  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="contact__wrapper">
          {/* Left \u2013 Info */}
          <div className="contact__info">
            <span className="section-tag section-tag--light">Contact Us</span>
            <h2 className="contact__title">
              Ready to Simplify Your Meeting Room Scheduling?
            </h2>
            <p className="contact__subtitle">
              Get in touch to subscribe, schedule a demo, or ask any questions.
              Our team will respond within 24 hours.
            </p>
            <div className="contact__details">
              <div className="contact__detail">
                <Mail size={20} />
                <div>
                  <span className="contact__detail-label">Email</span>
                  <span className="contact__detail-value">hello@meetspace.io</span>
                </div>
              </div>
              <div className="contact__detail">
                <Phone size={20} />
                <div>
                  <span className="contact__detail-label">Phone</span>
                  <span className="contact__detail-value">+1 (555) 123-4567</span>
                </div>
              </div>
              <div className="contact__detail">
                <MapPin size={20} />
                <div>
                  <span className="contact__detail-label">Office</span>
                  <span className="contact__detail-value">123 Business Ave, Suite 200</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right \u2013 Form */}
          <form className="contact__form" onSubmit={handleSubmit}>
            {submitted ? (
              <div className="contact__success">
                <CheckCircle size={48} />
                <h3>Thank You!</h3>
                <p>We've received your inquiry. Our team will reach out to you shortly.</p>
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
                      placeholder="John Doe"
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
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="company">Company Name *</label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Acme Corp"
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
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    placeholder="Tell us about your requirements..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn--primary btn--full">
                  <Send size={18} />
                  Send Message
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
