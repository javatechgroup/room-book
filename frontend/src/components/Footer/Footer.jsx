import React from 'react';
import { Building2, ArrowUp, Mail, Phone, MapPin, Clock, LogIn, HelpCircle, ShieldCheck, Users, MessageSquare } from 'lucide-react';
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

  // If user is authenticated in any portal, display a sleek, compact dashboard footer
  if (isAuthenticated) {
    const roleLabel = isSuperAdmin
      ? 'Global Super Admin'
      : isFacilityAdmin
      ? 'Facility Administrator'
      : 'Staff Member';

    const portalLabel = isSuperAdmin
      ? 'Super Admin Control Center'
      : isFacilityAdmin
      ? 'Facility Admin Portal'
      : 'Workplace Portal';

    const statusLabel = isSuperAdmin
      ? 'Multi-Tenant Cluster Active'
      : 'System Operational';

    const supportLabel = isSuperAdmin
      ? 'Global System Support'
      : 'Facilities Support';

    const copyrightLabel = isSuperAdmin
      ? `© ${currentYear} Enterprise Super Admin • Cloud Infrastructure`
      : isFacilityAdmin
      ? `© ${currentYear} Facility Management • Building A Operations`
      : `© ${currentYear} Workplace Portal`;

    return (
      <footer className={`footer footer--dashboard ${isSuperAdmin ? 'footer--superadmin' : ''}`}>
        <div className="container">
          <div className="footer-dashboard-bar">
            <div className="footer-dashboard-left">
              <a href="#" onClick={scrollToTop} className="footer-dashboard-logo">
                {isSuperAdmin ? (
                  <ShieldCheck size={16} className="footer-brand-icon footer-brand-icon--sa" />
                ) : (
                  <Building2 size={16} className="footer-brand-icon" />
                )}
                <span>{portalLabel}</span>
              </a>
              <span className={`footer-role-badge ${isSuperAdmin ? 'footer-role-badge--superadmin' : isFacilityAdmin ? 'footer-role-badge--admin' : ''}`}>
                {isSuperAdmin && <ShieldCheck size={11} style={{ marginRight: '3px' }} />}
                {roleLabel}
              </span>
              <div className="footer-status-indicator">
                <span className="status-dot status-dot--online" />
                <span>{statusLabel}</span>
              </div>
            </div>

            <div className="footer-dashboard-right">
              <button
                type="button"
                className="footer-dash-link-btn"
                onClick={openConnect}
              >
                <MessageSquare size={13} />
                <span>{supportLabel}</span>
              </button>
              <span className="footer-dash-divider">•</span>
              <span className="footer-dash-copy">{copyrightLabel}</span>
              <button type="button" className="footer__back-to-top" onClick={scrollToTop}>
                <span>Top</span>
                <ArrowUp size={13} />
              </button>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Unauthenticated Landing Page Footer (Clean & Streamlined)
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          {/* Brand & Mission */}
          <div className="footer__brand">
            <a href="#" onClick={scrollToTop} className="footer__logo">
              <Building2 size={20} />
              <span>Workplace Portal</span>
            </a>
            <p className="footer__tagline">
              Internal scheduling platform for corporate meeting rooms and physical facilities.
            </p>
            <div className="footer__status-badge">
              <span className="status-dot status-dot--online" />
              <span>Campus System Active • Building A</span>
            </div>
          </div>

          {/* Column 1: Home Navigation */}
          <div className="footer__column">
            <h4 className="footer__heading">Navigation</h4>
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
                  Contact Facilities
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Campus Info */}
          <div className="footer__column">
            <h4 className="footer__heading">Campus Information</h4>
            <ul className="footer__info-list">
              <li>
                <MapPin size={13} className="footer__link-icon" />
                <span>Workplace Headquarters</span>
              </li>
              <li>
                <Mail size={13} className="footer__link-icon" />
                <a href="mailto:inquiries@roombook.io">inquiries@roombook.io</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer__bottom">
          <p>&copy; {currentYear} Workplace Room Portal. All rights reserved.</p>
          <button type="button" className="footer__back-to-top" onClick={scrollToTop}>
            <span>Back to top</span>
            <ArrowUp size={13} />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
