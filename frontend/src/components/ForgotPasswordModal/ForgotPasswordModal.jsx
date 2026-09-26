import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/authApi';
import './ForgotPasswordModal.css';

function ForgotPasswordModal() {
  const { isForgotOpen, closeForgotPassword, openLogin, openResetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isForgotOpen) {
      setError(null);
      setSubmitted(false);
      setEmail('');
    }
  }, [isForgotOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isForgotOpen) {
        closeForgotPassword();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isForgotOpen, closeForgotPassword]);

  if (!isForgotOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.trim()) {
      setError('Please enter your work email.');
      return;
    }

    setLoading(true);
    const result = await authApi.forgotPassword(email.trim());
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      toast.error('Request Failed', result.error);
    } else {
      setSubmitted(true);
      toast.success('Instructions Sent', 'Check your inbox for password reset instructions.');
    }
  };

  return (
    <div className="forgot-modal-overlay" onClick={closeForgotPassword}>
      <div
        className="forgot-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="forgot-modal__close"
          onClick={closeForgotPassword}
          aria-label="Close dialog"
          type="button"
        >
          <X size={18} />
        </button>

        <div className="forgot-modal__header">
          <div className="forgot-modal__icon-badge">
            <KeyRound size={22} />
          </div>
          <h2 className="forgot-modal__title">Reset your password</h2>
          <p className="forgot-modal__subtitle">
            Enter your work email address and we will send you instructions to recover your account
          </p>
        </div>

        {error && (
          <div className="forgot-modal__error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="forgot-modal__success-panel">
            <div className="success-icon-wrap">
              <CheckCircle2 size={32} />
            </div>
            <h3>Check your email</h3>
            <p>
              If an active account exists for <strong>{email}</strong>, we have dispatched a password reset link and token.
            </p>
            <div className="demo-hint-box">
              <Sparkles size={16} />
              <span>
                <strong>Demo Mode Active:</strong> Check the application server logs to view your simulated reset email with token and link.
              </span>
            </div>

            <div className="forgot-modal__actions-row">
              <button
                type="button"
                className="btn btn--primary btn--full"
                onClick={() => openResetPassword()}
              >
                <span>Enter Reset Token</span>
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="forgot-back-btn"
                onClick={openLogin}
              >
                <ArrowLeft size={15} />
                <span>Back to Sign In</span>
              </button>
            </div>
          </div>
        ) : (
          <form className="forgot-modal__form" onSubmit={handleSubmit}>
            <div className="forgot-modal__form-group">
              <label htmlFor="forgot-email">Work Email Address</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--full forgot-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-spinner">Sending link...</span>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="forgot-modal__footer-links">
              <button
                type="button"
                className="forgot-link-btn"
                onClick={openLogin}
              >
                <ArrowLeft size={14} />
                <span>Return to Sign In</span>
              </button>
              <button
                type="button"
                className="forgot-link-btn forgot-link-btn--token"
                onClick={() => openResetPassword()}
              >
                Already have a token?
              </button>
            </div>
          </form>
        )}

        <div className="forgot-modal__footer-note">
          <ShieldCheck size={14} />
          <span>Encrypted account recovery</span>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
