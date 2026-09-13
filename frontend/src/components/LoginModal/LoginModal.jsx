import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  ShieldCheck,
  Building,
  User,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_ACCOUNTS } from '../../api/authApi';
import './LoginModal.css';

function LoginModal() {
  const { isLoginOpen, closeLogin, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeDemo, setActiveDemo] = useState(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isLoginOpen) {
      setError(null);
      // Pre-fill with default demo account if empty
      if (!email) {
        handleSelectDemo(DEMO_ACCOUNTS[0]);
      }
    }
  }, [isLoginOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isLoginOpen) {
        closeLogin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoginOpen, closeLogin]);

  if (!isLoginOpen) return null;

  const handleSelectDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setActiveDemo(account.role);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="login-modal-overlay" onClick={closeLogin}>
      <div
        className="login-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          className="login-modal__close"
          onClick={closeLogin}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="login-modal__header">
          <div className="login-modal__logo">
            <LayoutGrid size={28} />
            <span>MeetSpace</span>
          </div>
          <h2 className="login-modal__title">Sign in to your account</h2>
          <p className="login-modal__subtitle">
            Access your meeting rooms, bookings, and team schedules
          </p>
        </div>

        {/* Quick Demo Accounts */}
        <div className="login-modal__demo-section">
          <span className="login-modal__demo-label">Quick Demo Logins:</span>
          <div className="login-modal__demo-chips">
            {DEMO_ACCOUNTS.map((acc) => {
              const isSelected = activeDemo === acc.role;
              return (
                <button
                  key={acc.role}
                  type="button"
                  className={`demo-chip ${isSelected ? 'demo-chip--selected' : ''}`}
                  onClick={() => handleSelectDemo(acc)}
                  title={acc.description}
                >
                  <span className="demo-chip__icon">{acc.icon}</span>
                  <span className="demo-chip__title">{acc.roleLabel}</span>
                  {isSelected && <Check size={14} className="demo-chip__check" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="login-modal__error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="login-modal__form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Work Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="login-email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setActiveDemo(null);
                }}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full login-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-spinner">Signing in...</span>
            ) : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Modal Footer Note */}
        <div className="login-modal__footer-note">
          <ShieldCheck size={16} />
          <span>Secured with Spring Security & JWT token authentication</span>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
