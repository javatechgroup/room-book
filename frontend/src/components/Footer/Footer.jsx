import React from 'react';
import { Building2, ArrowUp, Mail, Phone, MapPin, Clock, LogIn, HelpCircle, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  const { user, isAuthenticated, openLogin, openConnect } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isFacilityAdmin = user?.role === 'COMPANY_ADMIN';

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (sectionId === 'login-gateway') {
        const input = document.getElementById('corp-email');
        if (input) setTimeout(() => input.focus(), 400);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          {/* Brand & Mission */}
          <div className="footer__brand">
            <a href="#" onClick={scrollToTop} className="footer__logo">
              <Building2 size={24} />
              <span>Workplace Portal</span>
            </a>
            <p className="footer__tagline">
              Internal scheduling platform for corporate physical meeting spaces.
              Check room availability, avoid booking overlaps, and reserve conference rooms with instant door tablet sync.
            </p>
            <div className="footer__status-badge">
              <span className="status-dot status-dot--online" />
              <span>Campus System Active • Building A</span>
            </div>
          </div>

          {/* Conditional Middle Columns based on Authentication */}
          {isAuthenticated ? (
            isSuperAdmin ? (
              <>
                {/* Column 1: Super Admin Console Modules */}
                <div className="footer__column">
                  <h4 className="footer__heading">Platform Console</h4>
                  <ul>
                    <li>
                      <a href="#" onClick={scrollToTop}>
                        <Building2 size={13} className="footer__link-icon" />
                        Tenant Companies
                      </a>
                    </li>
                    <li>
                      <a href="#" onClick={scrollToTop}>
                        <Users size={13} className="footer__link-icon" />
                        Facility Administrators
                      </a>
                    </li>
                    <li>
                      <a href="#" onClick={scrollToTop}>
                        <ShieldCheck size={13} className="footer__link-icon" />
                        System Audit Logs
                      </a>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="footer__action-btn"
                        onClick={openConnect}
                      >
                        Campus Support Inquiry
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Column 2: Super Admin Session Details */}
                <div className="footer__column">
                  <h4 className="footer__heading">Session & Security</h4>
                  <ul className="footer__session-list">
                    <li>
                      <span className="footer__meta-label">Access Level:</span>
                      <span className="footer__meta-value footer__meta-value--badge">Global Super Admin</span>
                    </li>
                    <li>
                      <span className="footer__meta-label">Signed in as:</span>
                      <span className="footer__meta-value">{user?.email || 'superadmin@system.com'}</span>
                    </li>
                    <li>
                      <span className="footer__meta-label">Scope:</span>
                      <span className="footer__meta-value">Multi-Tenant Root</span>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                {/* Column 1: Workplace Navigation */}
                <div className="footer__column">
                  <h4 className="footer__heading">Workspace</h4>
                  <ul>
                    <li>
                      <a href="#" onClick={scrollToTop}>
                        <Building2 size={13} className="footer__link-icon" />
                        Conference Rooms
                      </a>
                    </li>
                    <li>
                      <a href="#" onClick={scrollToTop}>
                        <Clock size={13} className="footer__link-icon" />
                        My Reservations
                      </a>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="footer__action-btn"
                        onClick={openConnect}
                      >
                        Connect With Facilities
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Column 2: Account Details */}
                <div className="footer__column">
                  <h4 className="footer__heading">Account Context</h4>
                  <ul className="footer__session-list">
                    <li>
                      <span className="footer__meta-label">Organization:</span>
                      <span className="footer__meta-value">{user?.companyName || 'Corporate Space'}</span>
                    </li>
                    <li>
                      <span className="footer__meta-label">Role:</span>
                      <span className="footer__meta-value">
                        {isFacilityAdmin ? 'Facility Administrator' : 'Staff Member'}
                      </span>
                    </li>
                    <li>
                      <span className="footer__meta-label">User:</span>
                      <span className="footer__meta-value">{user?.name || user?.email}</span>
                    </li>
                  </ul>
                </div>
              </>
            )
          ) : (
            <>
              {/* Column 1: Home Navigation */}
              <div className="footer__column">
                <h4 className="footer__heading">Home Navigation</h4>
                <ul>
                  <li>
                    <a href="#login-gateway" onClick={(e) => scrollToSection(e, 'login-gateway')}>
                      <LogIn size={13} className="footer__link-icon" />
                      Sign In to Portal
                    </a>
                  </li>
                  <li>
                    <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')}>
                      <HelpCircle size={13} className="footer__link-icon" />
                      How It Works
                    </a>
                  </li>
                  <li>
                    <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')}>
                      <Mail size={13} className="footer__link-icon" />
                      Connect With Facilities
                    </a>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="footer__action-btn"
                      onClick={openConnect}
                    >
                      Quick Inquiry Form
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 2: Demo Accounts on Home Page */}
              <div className="footer__column">
                <h4 className="footer__heading">Demo Access</h4>
                <ul>
                  <li>
                    <a
                      href="#login-gateway"
                      onClick={(e) => scrollToSection(e, 'login-gateway')}
                      title="Role: SUPER_ADMIN (superadmin@system.com)"
                    >
                      <ShieldCheck size={13} className="footer__link-icon" />
                      Super Admin
                    </a>
                  </li>
                  <li>
                    <a
                      href="#login-gateway"
                      onClick={(e) => scrollToSection(e, 'login-gateway')}
                      title="Role: COMPANY_ADMIN (admin@acme.com)"
                    >
                      <Building2 size={13} className="footer__link-icon" />
                      Facility Admin
                    </a>
                  </li>
                  <li>
                    <a
                      href="#login-gateway"
                      onClick={(e) => scrollToSection(e, 'login-gateway')}
                      title="Role: EMPLOYEE (john.doe@acme.com)"
                    >
                      <span className="footer__bullet">•</span>
                      Employee Access
                    </a>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="footer__action-btn"
                      onClick={openLogin}
                    >
                      Open Sign In Dialog
                    </button>
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* Column 3: Campus & Facilities Info */}
          <div className="footer__column">
            <h4 className="footer__heading">Campus Information</h4>
            <ul className="footer__info-list">
              <li>
                <MapPin size={14} className="footer__link-icon" />
                <span>123 Workplace Plaza, Suite 400</span>
              </li>
              <li>
                <Mail size={14} className="footer__link-icon" />
                <a href="mailto:inquiries@roombook.io">inquiries@roombook.io</a>
              </li>
              <li>
                <Phone size={14} className="footer__link-icon" />
                <a href="tel:+15552345678">+1 (555) 234-5678</a>
              </li>
              <li>
                <Clock size={14} className="footer__link-icon" />
                <span>Mon–Sat: 8:00 AM – 8:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer__bottom">
          <p>&copy; {currentYear} Workplace Portal • Building A Campus Operations. All rights reserved.</p>
          <button type="button" className="footer__back-to-top" onClick={scrollToTop}>
            <span>Back to top</span>
            <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
