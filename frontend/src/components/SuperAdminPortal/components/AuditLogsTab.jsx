import React from 'react';
import { Clock } from 'lucide-react';

export default function AuditLogsTab({ auditLogs = [] }) {
  return (
    <div className="superadmin-panel">
      <div className="superadmin-toolbar">
        <h3 className="panel-subheading">System Configuration & Multi-Tenant Audit Trail</h3>
        <span className="audit-note">
          Immutable record of tenant provisioning and credential assignments
        </span>
      </div>

      {/* Desktop Audit Logs Table */}
      <div className="desktop-table-wrap">
        <div className="table-responsive">
          <table className="superadmin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Entity Type</th>
                <th>Target Resource</th>
                <th>Performed By</th>
                <th>Audit Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="td-subtle">
                    <Clock size={12} className="inline-icon" />
                    {log.timestamp}
                  </td>
                  <td>
                    <span className="action-tag">{log.action}</span>
                  </td>
                  <td>
                    <span className="entity-tag">{log.entityType}</span>
                  </td>
                  <td className="td-strong">{log.entityName}</td>
                  <td>{log.performedBy}</td>
                  <td className="td-details">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List for Audit Logs (Visible on mobile/tablet < 768px) */}
      <div className="mobile-card-list">
        {auditLogs.map((log) => (
          <div key={log.id} className="mobile-card">
            <div className="mobile-card__header">
              <span className="action-tag">{log.action}</span>
              <span className="td-subtle">
                <Clock size={12} className="inline-icon" />
                {log.timestamp}
              </span>
            </div>

            <div className="mobile-card__title-row">
              <h4 className="mobile-card__title">{log.entityName}</h4>
              <span className="entity-tag">{log.entityType}</span>
            </div>

            <div className="mobile-card__details">
              <div className="mobile-card__info-row">
                <span className="mobile-card__text">{log.details}</span>
              </div>
            </div>

            <div className="mobile-card__footer">
              <span className="td-subtle" style={{ fontSize: '0.78rem' }}>
                Logged by: {log.performedBy}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
