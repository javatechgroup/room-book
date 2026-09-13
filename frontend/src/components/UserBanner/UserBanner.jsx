import React from 'react';
import { Shield, Building, User, LogOut, Calendar, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './UserBanner.css';

function UserBanner() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated || !user) return null;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return {
          label: 'Super Admin',
          icon: Shield,
          color: '#8b5cf6',
          bg: 'rgba(139, 92, 246, 0.12)',
          desc: 'Full system privileges • Company & Admin management',
        };
      case 'COMPANY_ADMIN':
        return {
          label: 'Company Admin',
          icon: Building,
          color: '#3b82f6',
          bg: 'rgba(59, 130, 246, 0.12)',
          desc: 'Company management • Rooms, Departments & Policies',
        };
      case 'EMPLOYEE':
      default:
        return {
          label: 'Employee',
          icon: User,
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.12)',
          desc: 'Meeting scheduling • Room search & calendar invites',
        };
    }
  };

  const roleInfo = getRoleBadge(user.role);
  const IconComponent = roleInfo.icon;

  return (
    <aside aria-label="Authenticated session" className="user-banner">
      <div className="container user-banner__inner">
        <div className="user-banner__left">
          <div
            className="user-banner__avatar"
            style={{ backgroundColor: roleInfo.bg, color: roleInfo.color }}
          >
            <IconComponent size={20} />
          </div>
          <div className="user-banner__details">
            <div className="user-banner__greeting">
              <span className="user-banner__name">
                Welcome back, <strong>{user.fullName || user.email}</strong>
              </span>
              <span
                className="user-banner__badge"
                style={{
                  backgroundColor: roleInfo.bg,
                  color: roleInfo.color,
                  borderColor: `${roleInfo.color}33`,
                }}
              >
                <CheckCircle2 size={12} />
                {roleInfo.label}
              </span>
            </div>
            <p className="user-banner__desc">
              {roleInfo.desc}
              {user.companyId && ` • Company #${user.companyId}`}
            </p>
          </div>
        </div>

        <div className="user-banner__actions">
          <a href="#features" className="btn btn--outline btn--sm user-banner__btn">
            <Calendar size={14} />
            Explore Dashboard
          </a>
          <button
            type="button"
            className="btn btn--sm user-banner__logout-btn"
            onClick={logout}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}

export default UserBanner;
