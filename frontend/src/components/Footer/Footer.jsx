import React from 'react';
import { Building2 } from 'lucide-react';
import './Footer.css';

const footerLinks = {
  Workplace: ['How It Works', 'Campus Floors', 'Slot Availability', 'Smart Suggestions'],
  Facilities: ['Room Directory', 'Maintenance Logs', 'Booking Policies', 'Ops Desk'],
  Administration: ['Building Settings', 'Department Allocations', 'Duration Limits', 'Audit Logs'],
  'Client & Support': ['Deploy For Your Company', 'Client Inquiries', 'Facility Helpdesk', 'System Status'],
};

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <a href="#" className="footer__logo">
              <Building2 size={24} />
              <span>Workplace Portal</span>
            </a>
            <p className="footer__tagline">
              Managing physical meeting rooms across company offices. Instant slot availability checks,
              conflict-free reservations, and smart room suggestions when slots are occupied.
            </p>
          </div>
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div className="footer__column" key={heading}>
              <h4 className="footer__heading">{heading}</h4>
              <ul>
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href={
                        link === 'How It Works'
                          ? '#how-it-works'
                          : link.includes('Company') || link.includes('Inquiries')
                          ? '#contact'
                          : '#'
                      }
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer__bottom">
          <p>&copy; {currentYear} Corporate Workplace Operations • Building A Campus. All rights reserved.</p>
          <p>
            Internal Physical Room & Slot Management
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
