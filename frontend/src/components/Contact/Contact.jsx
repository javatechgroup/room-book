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
  Zap,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import './Contact.css';

const INQUIRY_TYPES = [
  { id: 'register', label: '🏢 Register Company', defaultMsg: 'We would like to register our company on MeetSpace and provision our workplace portal.' },
  { id: 'policies', label: '🛡️ Policy Setup', defaultMsg: 'We want to configure company-wide booking rules, advance notice windows, and duration limits.' },
  { id: 'facility', label: '📍 Facility & Team', defaultMsg: 'We need assistance setting up our physical floors, meeting rooms, departments, and employee access.' },
  { id: 'demo', label: '🔍 Live Demo', defaultMsg: 'We would like to schedule a 1-on-1 walkthrough of the employee portal and facility admin dashboard.' },
];

function Contact() {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState('register');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: INQUIRY_TYPES[0].defaultMsg,
  });
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTypeSelect = (type) => {
    setSelectedType(type.id);
    setFormData((prev) => ({
      ...prev,
      message: type.defaultMsg,
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText('inquiries@roombook.io');
    setCopiedEmail(true);
    toast.info('Email Copied', 'inquiries@roombook.io copied to clipboard');
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success(
        'Inquiry Received!',
        `Thank you, ${formData.name || 'valued customer'}. Our team will contact you at ${formData.email} within 24 hours.`
      );
    }, 500);

    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: INQUIRY_TYPES[0].defaultMsg,
      });
      setSelectedType('register');
    }, 5000);
  };

  return (
    <section className="contact" id="contact">
      <div className="container">
        {/* Section Header with high-contrast visible tag */}
        <div className="contact__header">
          <span className="section-tag section-tag--primary">
            <Zap size={14} /> Enterprise Onboarding & Solutions
          </span>
          <h2 className="contact__title">Connect With Our Workplace Team</h2>
          <p className="contact__subtitle">
            Ready to bring conflict-free room scheduling and automated booking policies to your organization?
            Reach out directly for customized deployment or enterprise assistance.
          </p>
        </div>

        <div className="contact__wrapper">
          {/* Left Column: Compact Channels & Guarantees */}
          <div className="contact__info">
            {/* Consolidated Direct Channels Card */}
            <div className="contact__channels-box">
              <h4 className="channels-title">Direct Communication Channels</h4>
              
              <div className="channel-row">
                <div className="channel-row__icon channel-row__icon--blue">
                  <Mail size={16} />
                </div>
                <div className="channel-row__text">
                  <span className="channel-row__label">Client Solutions</span>
                  <a href="mailto:inquiries@roombook.io" className="channel-row__val">
                    inquiries@roombook.io
                  </a>
                </div>
                <button
                  type="button"
                  className="channel-row__copy-btn"
                  onClick={handleCopyEmail}
                  title="Copy email"
                  aria-label="Copy email"
                >
                  {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              <div className="channel-row">
                <div className="channel-row__icon channel-row__icon--emerald">
                  <Phone size={16} />
                </div>
                <div className="channel-row__text">
                  <span className="channel-row__label">Direct Enterprise Line</span>
                  <a href="tel:+15552345678" className="channel-row__val">
                    +1 (555) 234-5678
                  </a>
                </div>
              </div>

              <div className="channel-row">
                <div className="channel-row__icon channel-row__icon--purple">
                  <MapPin size={16} />
                </div>
                <div className="channel-row__text">
                  <span className="channel-row__label">Headquarters</span>
                  <span className="channel-row__val">123 Workplace Plaza, Suite 400</span>
                </div>
              </div>
            </div>

            {/* Compact Guarantee Box */}
            <div className="contact__compact-guarantee">
              <div className="compact-guarantee__header">
                <ShieldCheck size={17} className="guarantee-icon" />
                <strong>The MeetSpace Enterprise Advantage</strong>
              </div>
              <ul className="compact-guarantee__list">
                <li>
                  <span className="dot" />
                  <span><strong>Zero Double-Bookings:</strong> Concurrency engine locks slots with 0% clash.</span>
                </li>
                <li>
                  <span className="dot" />
                  <span><strong>Custom Policy Setup:</strong> Enforce advance windows, max durations, & cutoffs.</span>
                </li>
                <li>
                  <span className="dot" />
                  <span><strong>Dedicated Specialist:</strong> Tenant provisioning & setup support within 48h.</span>
                </li>
              </ul>
              <div className="compact-sla">
                <Zap size={12} />
                <span>Guaranteed 24-hour response SLA</span>
              </div>
            </div>
          </div>

          {/* Right Column: Streamlined Form */}
          <div className="contact__form-container">
            <form className="contact__form" onSubmit={handleSubmit}>
              {submitted ? (
                <div className="contact__success animate-fadeIn">
                  <CheckCircle2 size={44} className="success-icon" />
                  <h3>Inquiry Received!</h3>
                  <p>
                    A workplace solutions specialist has received your request and will reach out to <strong>{formData.email}</strong> within 24 hours.
                  </p>
                  <span className="success-ref">Ref: MS-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
              ) : (
                <>
                  <div className="contact__form-top">
                    <span className="form-legend">Select Inquiry Topic:</span>
                    {/* Compact Category Pills */}
                    <div className="contact__pills-group">
                      {INQUIRY_TYPES.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          className={`inquiry-pill ${selectedType === type.id ? 'inquiry-pill--active' : ''}`}
                          onClick={() => handleTypeSelect(type)}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="contact__form-grid">
                    <div className="contact__field">
                      <label htmlFor="contact-name">
                        Full Name <span className="req">*</span>
                      </label>
                      <div className="contact__input-wrap">
                        <User size={14} className="contact__input-icon" />
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          placeholder="Jane Doe"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          autoComplete="name"
                        />
                      </div>
                    </div>

                    <div className="contact__field">
                      <label htmlFor="contact-email">
                        Work Email <span className="req">*</span>
                      </label>
                      <div className="contact__input-wrap">
                        <Mail size={14} className="contact__input-icon" />
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          placeholder="jane@company.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="contact__field">
                      <label htmlFor="contact-company">Company</label>
                      <div className="contact__input-wrap">
                        <Building2 size={14} className="contact__input-icon" />
                        <input
                          id="contact-company"
                          name="company"
                          type="text"
                          placeholder="Company name"
                          value={formData.company}
                          onChange={handleChange}
                          autoComplete="organization"
                        />
                      </div>
                    </div>

                    <div className="contact__field">
                      <label htmlFor="contact-phone">Phone</label>
                      <div className="contact__input-wrap">
                        <Phone size={14} className="contact__input-icon" />
                        <input
                          id="contact-phone"
                          name="phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={formData.phone}
                          onChange={handleChange}
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="contact__field">
                    <label htmlFor="contact-message">Requirements / Message</label>
                    <div className="contact__input-wrap">
                      <MessageSquare size={14} className="contact__input-icon contact__input-icon--textarea" />
                      <textarea
                        id="contact-message"
                        name="message"
                        rows="2"
                        placeholder="Tell us about your physical office spaces or requirements..."
                        value={formData.message}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn--primary btn--full contact__submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Send Corporate Inquiry</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>

                  <div className="contact__reassurance">
                    <ShieldCheck size={13} />
                    <span>Direct response within 24 hours • Zero double-booking guarantee • Zero spam</span>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
