import React, { useState } from 'react';
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Sparkles,
  AlertCircle,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './LoginGateway.css';

function LoginGateway() {
  const { login, openLogin, openConnect, openForgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both corporate email and password.');
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
    <div className="login-gateway" id="login-gateway">
      <div className="container login-gateway__container">
        {/* Left Side: Corporate Workplace Branding & Overview */}
        <div className="login-gateway__brand-panel">
          <div className="brand-header">
            <div className="brand-badge">
              <span className="pulse-dot" />
              <Building2 size={15} />
              <span>Campus Facility Portal</span>
            </div>
            <h1 className="brand-title">
              Workplace Meeting Room <br />
              <span className="brand-title--accent">Management Portal</span>
            </h1>
            <p className="brand-desc">
              Internal scheduling platform for company physical meeting spaces.
              Sign in with your corporate credentials to check room availability,
              reserve slots, and view intelligent room suggestions.
            </p>
          </div>

          <div className="brand-features">
            <div className="brand-feature-item">
              <div className="feature-icon">
                <Sparkles size={18} />
              </div>
              <div>
                <strong>Intelligent Conflict Resolution</strong>
                <p>Occupied slot? Automatically get the room's next opening and alternative rooms.</p>
              </div>
            </div>

            <div className="brand-feature-item">
              <div className="feature-icon">
                <Layers size={18} />
              </div>
              <div>
                <strong>Multi-Floor Physical Coverage</strong>
                <p>Spaces across all floors including Focus Pods, Team Rooms, and Boardrooms.</p>
              </div>
            </div>

            <div className="brand-feature-item">
              <div className="feature-icon">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <strong>Guaranteed Conflict-Free Allocation</strong>
                <p>Prevents overlapping reservations across company meeting rooms with strict slot locking.</p>
              </div>
            </div>

            <div className="brand-feature-item">
              <div className="feature-icon">
                <ShieldCheck size={18} />
              </div>
              <div>
                <strong>Role-Based Workplace Privileges</strong>
                <p>Employee room booking and Facility Admin maintenance & policy management.</p>
              </div>
            </div>
          </div>

          {/* Client Inquiries Callout */}
          <div className="gateway-contact-callout">
            <div className="gateway-contact-callout__icon">
              <Mail size={18} />
            </div>
            <div className="gateway-contact-callout__text">
              <strong>Looking to deploy this room system for your company?</strong>
              <p>Connect with our corporate solutions team to schedule an enterprise walkthrough or set up for your company.</p>
              <button
                type="button"
                className="contact-link"
                onClick={openConnect}
              >
                Connect With Our Team <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Mobile Only: Button to open Sign-In Popup */}
          <div className="gateway-mobile-auth-cta">
            <button
              type="button"
              className="btn btn--primary btn--full"
              onClick={openLogin}
            >
              <LogIn size={16} /> Sign In to Workplace Portal
            </button>
            <span className="gateway-mobile-auth-hint">
              Tap to open the secure corporate sign-in dialog
            </span>
          </div>
        </div>

        {/* Right Side: Professional Corporate Sign-In Form */}
        <div className="login-gateway__form-panel">
          <div className="gateway-card">
            <div className="gateway-card__header">
              <div className="gateway-card__logo">
                <Building2 size={24} />
                <span>Workplace Portal</span>
              </div>
              <h2>Sign in to your account</h2>
              <p>Enter your corporate credentials below</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="gateway-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form className="gateway-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="corp-email">Corporate Email</label>
                <div className="input-wrap">
                  <Mail size={16} className="input-icon" />
                  <input
                    id="corp-email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-with-link">
                  <label htmlFor="corp-password">Password</label>
                  <button
                    type="button"
                    className="gateway-forgot-link"
                    onClick={openForgotPassword}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="input-wrap">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="corp-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn--primary btn--full gateway-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    Sign In to Portal <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="gateway-card__footer">
              <ShieldCheck size={15} className="gateway-card__footer-icon" />
              <span>Enterprise 256-bit encryption • Role-based access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginGateway;
