import React from 'react';
import { LayoutGrid } from 'lucide-react';
import './Footer.css';

const footerLinks = {
  Product: ['Features', 'Pricing', 'Integrations', 'Changelog'],
  Company: ['About Us', 'Careers', 'Blog', 'Press'],
  Resources: ['Documentation', 'Help Center', 'API Reference', 'Status'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
};

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <a href="#" className="footer__logo">
              <LayoutGrid size={24} />
              <span>MeetSpace</span>
            </a>
            <p className="footer__tagline">
              The smart way to manage meeting rooms. Book conference rooms, invite participants, and keep your team organized.
            </p>
            <div className="footer__social">
              <a href="#" className="footer__social-link" aria-label="Twitter">𝕏</a>
              <a href="#" className="footer__social-link" aria-label="LinkedIn">in</a>
              <a href="#" className="footer__social-link" aria-label="GitHub">GH</a>
            </div>
          </div>
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div className="footer__column" key={heading}>
              <h4 className="footer__heading">{heading}</h4>
              <ul>
                {links.map((link) => (
                  <li key={link}>
                    <a href="#">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer__bottom">
          <p>&copy; {currentYear} MeetSpace. All rights reserved.</p>
          <p>
            Made with ❤️ for productive meetings
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
