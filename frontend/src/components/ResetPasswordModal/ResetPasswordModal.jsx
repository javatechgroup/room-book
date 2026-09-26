import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/authApi';
import './ResetPasswordModal.css';

function ResetPasswordModal() {
  const { isResetOpen, resetToken: initialToken, closeResetPassword, openLogin } = useAuth();
  const { toast } = useToast();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isResetOpen) {
      setToken(initialToken || '');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setSuccess(false);
    }
  }, [isResetOpen, initialToken]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isResetOpen) {
        closeResetPassword();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isResetOpen, closeResetPassword]);

  if (!isResetOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanToken = token.trim();
    if (!cleanToken) {
      setError('Please provide your password reset token.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    const result = await authApi.resetPassword(cleanToken, newPassword);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      toast.error('Reset Failed', result.error);
    } else {
      setSuccess(true);
      toast.success('Password Updated', 'Your password has been reset successfully. Please sign in.');
    }
  };

  const handleGoToLogin = () => {
    closeResetPassword();
    openLogin();
  };

  return (
    <div className="reset-modal-overlay" onClick={closeResetPassword}>
      <div
        className="reset-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="reset-modal__close"
          onClick={closeResetPassword}
          aria-label="Close dialog"
          type="button"
        >
          <X size={18} />
        </button>

        <div className="reset-modal__header">
          <div className="reset-modal__icon-badge">
            <Lock size={22} />
          </div>
          <h2 className="reset-modal__title">Set new password</h2>
          <p className="reset-modal__subtitle">
            Enter your reset token and choose a secure new password for your account
          </p>
        </div>

        {error && (
          <div className="reset-modal__error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="reset-modal__success-panel">
            <div className="success-icon-wrap">
              <CheckCircle2 size={32} />
            </div>
            <h3>Password Reset Complete</h3>
            <p>Your password has been changed securely. You can now access your workplace portal.</p>
            <button
              type="button"
              className="btn btn--primary btn--full"
              onClick={handleGoToLogin}
            >
              <span>Sign In with New Password</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <form className="reset-modal__form" onSubmit={handleSubmit}>
            <div className="reset-modal__form-group">
              <label htmlFor="reset-token">Reset Token</label>
              <div className="input-with-icon">
                <KeyRound size={16} className="input-icon" />
                <input
                  id="reset-token"
                  type="text"
                  placeholder="Paste token received in email..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="reset-modal__form-group">
              <label htmlFor="new-password">New Password</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="reset-modal__form-group">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--full reset-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-spinner">Updating password...</span>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="reset-modal__footer-links">
              <button
                type="button"
                className="reset-link-btn"
                onClick={handleGoToLogin}
              >
                <ArrowLeft size={14} />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}

        <div className="reset-modal__footer-note">
          <ShieldCheck size={14} />
          <span>Enterprise password encryption</span>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordModal;
