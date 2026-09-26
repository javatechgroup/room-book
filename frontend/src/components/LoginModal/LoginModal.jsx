import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Building2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './LoginModal.css';

function LoginModal() {
  const { isLoginOpen, closeLogin, login, openForgotPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset error when modal opens/closes
  useEffect(() => {
    if (isLoginOpen) {
      setError(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both work email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      toast.error('Authentication Failed', result.error || 'Invalid email or password.');
    } else {
      toast.success('Signed In Successfully', `Welcome back, ${result.user?.fullName || result.user?.name || 'User'}!`);
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
        {/* Sleek Ghost Close Button */}
        <button
          className="login-modal__close"
          onClick={closeLogin}
          aria-label="Close dialog"
          type="button"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="login-modal__header">
          <div className="login-modal__icon-badge">
            <Building2 size={22} />
          </div>
          <h2 className="login-modal__title">Sign in to Workplace</h2>
          <p className="login-modal__subtitle">
            Enter your credentials to access rooms and schedules
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="login-modal__error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="login-modal__form" onSubmit={handleSubmit}>
          <div className="login-modal__form-group">
            <label htmlFor="login-email">Work Email</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                id="login-email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="login-modal__form-group">
            <div className="label-with-link">
              <label htmlFor="login-password">Password</label>
              <button
                type="button"
                className="login-forgot-link"
                onClick={openForgotPassword}
              >
                Forgot password?
              </button>
            </div>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
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
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                <span>Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="login-modal__footer-note">
          <ShieldCheck size={14} />
          <span>Encrypted workplace access</span>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
