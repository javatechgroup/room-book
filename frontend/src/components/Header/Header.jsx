import React, { useState, useEffect } from 'react';
import {
  Building2,
  Menu,
  X,
  Sun,
  Moon,
  LogIn,
  LogOut,
  User,
  Shield,
  Building,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Header.css';

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout, openLogin, openConnect } = useAuth();
  const { toast } = useToast();

  const navLinks = isAuthenticated
    ? []
    : [
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Sign In', href: '#login-gateway' },
      ];

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('meetspace-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('meetspace-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return Shield;
      case 'COMPANY_ADMIN':
        return Building;
      default:
        return User;
    }
  };

  const getRoleShortLabel = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'COMPANY_ADMIN':
        return 'Facility Admin';
      default:
        return 'Employee';
    }
  };

  const handleNavLinkClick = (e, link) => {
    setMobileOpen(false);
    if (link.label === 'Sign In') {
      const emailInput = document.getElementById('corp-email');
      // If embedded form is visible on desktop, scroll to it and focus
      if (emailInput && emailInput.offsetParent !== null) {
        e.preventDefault();
        emailInput.focus();
        emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Mobile or when form is hidden: open modal popup
        e.preventDefault();
        openLogin();
      }
    } else if (link.label === 'Connect With Us') {
      e.preventDefault();
      openConnect();
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Signed Out', 'You have been safely signed out.');
  };

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="container header__inner">
        <a href="#" className="header__logo">
          <Building2 size={26} className="header__logo-icon" />
          <div className="header__brand-text">
            <span className="header__logo-text">
              {user?.role === 'SUPER_ADMIN' ? 'Super Admin Portal' : 'Workplace Portal'}
            </span>
            <span className="header__logo-sub">
              {user?.role === 'SUPER_ADMIN' ? 'Tenant & Access Management' : 'Building A • Room Manager'}
            </span>
          </div>
        </a>

        {/* Navigation / Mobile Menu Drawer */}
        <nav className={`header__nav ${mobileOpen ? 'header__nav--open' : ''}`}>
          <div className="header__nav-top">
            <div className="header__nav-brand">
              <Building2 size={20} className="header__logo-icon" />
              <span>{user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Workplace'}</span>
            </div>
            <button
              type="button"
              className="header__nav-close"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="header__nav-body">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="header__link"
                onClick={(e) => handleNavLinkClick(e, link)}
              >
                {link.label}
              </a>
            ))}

            {isAuthenticated ? (
              <div className="header__user-mobile">
                <div className="header__user-mobile-card">
                  <div className="header__user-mobile-avatar">
                    {React.createElement(getRoleIcon(user.role), { size: 20 })}
                  </div>
                  <div className="header__user-mobile-info">
                    <span className="header__user-name">{user.fullName || user.email?.split('@')[0]}</span>
                    {user.email && <span className="header__user-email">{user.email}</span>}
                    <span className="header__user-role-badge">
                      {getRoleShortLabel(user.role)}
                    </span>
                  </div>
                </div>

                <div className="header__nav-theme-row">
                  <span className="header__nav-theme-label">Theme Mode</span>
                  <button
                    type="button"
                    className="btn btn--outline btn--sm theme-switch-btn"
                    onClick={toggleTheme}
                  >
                    {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                    <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="header__nav-auth">
                <button
                  type="button"
                  className="btn btn--primary btn--sm btn--full"
                  onClick={() => {
                    openConnect();
                    setMobileOpen(false);
                  }}
                >
                  <Mail size={15} /> Connect With Us
                </button>
              </div>
            )}
          </div>

          {isAuthenticated && (
            <div className="header__nav-footer">
              <button
                type="button"
                className="btn btn--logout-mobile"
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Nav Backdrop */}
        {mobileOpen && (
          <div
            className="header__backdrop"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Right Side: Auth State or Sign In Button */}
        <div className="header__actions">
          {/* Desktop Auth State */}
          {isAuthenticated ? (
            <div className="header__user-pill">
              <div className="header__user-avatar">
                {React.createElement(getRoleIcon(user.role), { size: 16 })}
              </div>
              <div className="header__user-info">
                <span className="header__user-name">
                  {user.fullName || user.email?.split('@')[0]}
                </span>
                <span className="header__user-role-badge">
                  {getRoleShortLabel(user.role)}
                </span>
              </div>
              <button
                type="button"
                className="header__logout-btn"
                onClick={handleLogout}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn--primary btn--sm header__signin-btn"
              onClick={openConnect}
            >
              <Mail size={15} />
              <span>Connect With Us</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <Sun
              size={18}
              className={`theme-toggle__icon ${
                theme === 'light' ? 'theme-toggle__icon--active' : ''
              }`}
            />
            <Moon
              size={18}
              className={`theme-toggle__icon ${
                theme === 'dark' ? 'theme-toggle__icon--active' : ''
              }`}
            />
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            className="header__toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
