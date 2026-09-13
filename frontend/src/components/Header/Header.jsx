import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Menu,
  X,
  Sun,
  Moon,
  LogIn,
  LogOut,
  User,
  Shield,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
];

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout, openLogin } = useAuth();

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
        return 'Admin';
      default:
        return 'Employee';
    }
  };

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="container header__inner">
        <a href="#" className="header__logo">
          <LayoutGrid size={28} className="header__logo-icon" />
          <span className="header__logo-text">MeetSpace</span>
        </a>

        <nav className={`header__nav ${mobileOpen ? 'header__nav--open' : ''}`}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="header__link"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}

          {isAuthenticated ? (
            <div className="header__user-mobile">
              <div className="header__user-mobile-info">
                <span className="header__user-name">{user.fullName || user.email}</span>
                <span className="header__user-role-badge">
                  {getRoleShortLabel(user.role)}
                </span>
              </div>
              <button
                type="button"
                className="btn btn--sm btn--logout-mobile"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          ) : (
            <div className="header__nav-auth">
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => {
                  openLogin();
                  setMobileOpen(false);
                }}
              >
                <LogIn size={15} /> Sign In
              </button>
              <a
                href="#contact"
                className="btn btn--primary btn--sm"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </a>
            </div>
          )}
        </nav>

        <div className="header__actions">
          {/* Desktop Auth State */}
          {isAuthenticated ? (
            <div className="header__user-pill">
              <div className="header__user-avatar" title={user.fullName || user.email}>
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="header__user-info">
                <span className="header__user-name">
                  {user.fullName ? user.fullName.split(' ')[0] : 'User'}
                </span>
                <span className="header__user-role-badge">
                  {getRoleShortLabel(user.role)}
                </span>
              </div>
              <button
                type="button"
                className="header__logout-btn"
                onClick={logout}
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
              onClick={openLogin}
            >
              <LogIn size={15} />
              <span>Sign In</span>
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
