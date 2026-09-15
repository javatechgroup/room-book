import React from 'react';
import { Building2, Users } from 'lucide-react';

export default function SuperAdminMetrics({ companies = [], admins = [] }) {
  const activeCompaniesCount = companies.filter((c) => c.status === 'ACTIVE').length;
  const activeAdminsCount = admins.filter((a) => a.status === 'ACTIVE').length;
  const uniqueCoveredCompanies = new Set(admins.map((a) => a.companyId)).size;
  const activePercentage = Math.round((activeCompaniesCount / (companies.length || 1)) * 100);

  return (
    <div className="superadmin-metrics-grid">
      {/* Metric 1: Tenant Companies */}
      <div className="metric-card">
        <div className="metric-card__icon metric-card__icon--blue">
          <Building2 size={26} />
        </div>
        <div className="metric-card__info">
          <span className="metric-card__label">Tenant Companies</span>
          <div className="metric-card__row">
            <span className="metric-card__value">{companies.length}</span>
            <span className="metric-card__badge-pill">{activePercentage}% Active</span>
          </div>
          <span className="metric-card__sub">
            <strong>{activeCompaniesCount}</strong> active • {companies.length - activeCompaniesCount} suspended
          </span>
        </div>
      </div>

      {/* Metric 2: Facility Administrators */}
      <div className="metric-card">
        <div className="metric-card__icon metric-card__icon--purple">
          <Users size={26} />
        </div>
        <div className="metric-card__info">
          <span className="metric-card__label">Facility Administrators</span>
          <div className="metric-card__row">
            <span className="metric-card__value">{admins.length}</span>
            <span className="metric-card__badge-pill metric-card__badge-pill--purple">
              {activeAdminsCount} Active
            </span>
          </div>
          <span className="metric-card__sub">
            Assigned across {uniqueCoveredCompanies} tenant companies
          </span>
        </div>
      </div>
    </div>
  );
}
