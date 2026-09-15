import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Building2,
  User,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
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
    }, 4000);
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

          {/* Right Side: Client Inquiry Form (matches ContactModal component) */}
          <form className="contact__form" onSubmit={handleSubmit}>
            {submitted ? (
              <div className="contact__success">
                <CheckCircle2 size={44} />
                <h3>Thank You for Connecting!</h3>
                <p>Our corporate workplace specialist will reach out to you within 24 hours.</p>
              </div>
            ) : (
              <>
                <div className="contact__form-header">
                  <div className="contact__form-badge">
                    <Sparkles size={13} />
                    <span>Direct Solutions Inquiry</span>
                  </div>
                  <h3 className="contact__form-title">Send Us a Message</h3>
                  <p className="contact__form-subtitle">
                    Fill out the form below and our team will get back to you promptly.
                  </p>
                </div>

                <div className="contact__form-grid">
                  <div className="contact__field">
                    <label htmlFor="name">
                      Full Name <span className="req">*</span>
                    </label>
                    <div className="contact__input-wrap">
                      <User size={15} className="contact__input-icon" />
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
                  </div>

                  <div className="contact__field">
                    <label htmlFor="email">
                      Work Email <span className="req">*</span>
                    </label>
                    <div className="contact__input-wrap">
                      <Mail size={15} className="contact__input-icon" />
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

                  <div className="contact__field">
                    <label htmlFor="company">Company / Organization</label>
                    <div className="contact__input-wrap">
                      <Building2 size={15} className="contact__input-icon" />
                      <input
                        id="company"
                        name="company"
                        type="text"
                        placeholder="Acme Corporation"
                        value={formData.company}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="contact__field">
                    <label htmlFor="phone">Mobile / Phone Number</label>
                    <div className="contact__input-wrap">
                      <Phone size={15} className="contact__input-icon" />
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
                </div>

                <div className="contact__field contact__field--full">
                  <label htmlFor="message">How Can We Help?</label>
                  <div className="contact__input-wrap">
                    <MessageSquare size={15} className="contact__input-icon contact__input-icon--textarea" />
                    <textarea
                      id="message"
                      name="message"
                      rows="3"
                      placeholder="Tell us about your physical office spaces, requirements, or any questions..."
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn--primary btn--full contact__submit-btn">
                  <Send size={15} />
                  <span>Send Inquiry to Our Team</span>
                </button>

                <div className="contact__reassurance">
                  <ShieldCheck size={13} />
                  <span>Your information is protected.</span>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
