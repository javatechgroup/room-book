import React, { useState } from 'react';
import {
  Building2,
  Users,
  Shield,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  Key,
  Layers,
  ArrowRight,
  RefreshCw,
  Clock,
  MapPin,
  Mail,
  Check,
  X,
  AlertCircle,
  Activity,
  FileText,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './SuperAdminPortal.css';

// Initial data seeded from Flyway V1 schema
const INITIAL_COMPANIES = [
  {
    id: 1,
    name: 'Acme Corporation',
    companyCode: 'ACME',
    contactInformation: 'admin@acme.com',
    address: '100 Tech Park, Suite 400, Silicon Corridor',
    status: 'ACTIVE',
    createdAt: '2026-09-01',
    departmentsCount: 1,
    roomsCount: 2,
  },
];

const INITIAL_ADMINS = [
  {
    id: 2,
    fullName: 'Acme Administrator',
    email: 'admin@acme.com',
    companyId: 1,
    companyName: 'Acme Corporation',
    role: 'COMPANY_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-09-01',
    lastLogin: 'Today, 10:45 AM',
  },
];

const INITIAL_AUDIT_LOGS = [
  {
    id: 101,
    action: 'CREATE_COMPANY',
    entityType: 'COMPANY',
    entityName: 'Acme Corporation',
    performedBy: 'superadmin@system.com',
    timestamp: '2026-09-01 09:00:00',
    details: 'Initial tenant company provisioned via Flyway V1 migration',
  },
  {
    id: 102,
    action: 'CREATE_FACILITY_ADMIN',
    entityType: 'USER',
    entityName: 'admin@acme.com',
    performedBy: 'superadmin@system.com',
    timestamp: '2026-09-01 09:05:00',
    details: 'Company Admin assigned to Acme Corporation with full floor privileges',
  },
];

export default function SuperAdminPortal() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('companies'); // 'companies' | 'admins' | 'audit'
  const [companies, setCompanies] = useState(INITIAL_COMPANIES);
  const [admins, setAdmins] = useState(INITIAL_ADMINS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  // Search & Filter state
  const [companySearch, setCompanySearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCompanyFilter, setAdminCompanyFilter] = useState('ALL');

  // Modals state
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    companyCode: '',
    contactInformation: '',
    address: '',
    status: 'ACTIVE',
  });

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [adminForm, setAdminForm] = useState({
    fullName: '',
    email: '',
    password: '',
    companyId: 1,
    status: 'ACTIVE',
  });

  // Toast message
  const [toast, setToast] = useState(null);
  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // --- Company Handlers ---
  const handleOpenCreateCompany = () => {
    setEditingCompany(null);
    setCompanyForm({
      name: '',
      companyCode: '',
      contactInformation: '',
      address: '',
      status: 'ACTIVE',
    });
    setIsCompanyModalOpen(true);
  };

  const handleOpenEditCompany = (comp) => {
    setEditingCompany(comp);
    setCompanyForm({
      name: comp.name,
      companyCode: comp.companyCode,
      contactInformation: comp.contactInformation || '',
      address: comp.address || '',
      status: comp.status,
    });
    setIsCompanyModalOpen(true);
  };

  const handleSaveCompany = (e) => {
    e.preventDefault();
    if (!companyForm.name.trim() || !companyForm.companyCode.trim()) {
      showToast('Validation Error', 'Company Name and Code are required.', 'error');
      return;
    }

    if (editingCompany) {
      // Update
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === editingCompany.id
            ? {
                ...c,
                ...companyForm,
                companyCode: companyForm.companyCode.toUpperCase(),
              }
            : c
        )
      );
      // Log audit
      const newAudit = {
        id: Date.now(),
        action: 'UPDATE_COMPANY',
        entityType: 'COMPANY',
        entityName: companyForm.name,
        performedBy: user?.email || 'superadmin@system.com',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        details: `Updated tenant company settings for ${companyForm.companyCode.toUpperCase()}`,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
      showToast('Company Updated', `Successfully updated ${companyForm.name}.`);
    } else {
      // Create
      const newId = companies.length > 0 ? Math.max(...companies.map((c) => c.id)) + 1 : 1;
      const newCompany = {
        id: newId,
        ...companyForm,
        companyCode: companyForm.companyCode.toUpperCase(),
        createdAt: new Date().toISOString().split('T')[0],
        departmentsCount: 0,
        roomsCount: 0,
      };
      setCompanies((prev) => [newCompany, ...prev]);
      const newAudit = {
        id: Date.now(),
        action: 'CREATE_COMPANY',
        entityType: 'COMPANY',
        entityName: newCompany.name,
        performedBy: user?.email || 'superadmin@system.com',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        details: `Registered new tenant company with code ${newCompany.companyCode}`,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
      showToast('Company Registered', `New tenant company "${newCompany.name}" created.`);
    }

    setIsCompanyModalOpen(false);
  };

  const handleToggleCompanyStatus = (companyId) => {
    setCompanies((prev) =>
      prev.map((c) => {
        if (c.id === companyId) {
          const nextStatus = c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          showToast(
            'Company Status Changed',
            `${c.name} is now ${nextStatus.toLowerCase()}.`,
            nextStatus === 'ACTIVE' ? 'success' : 'warning'
          );
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  // --- Facility Admin Handlers ---
  const handleOpenCreateAdmin = () => {
    setEditingAdmin(null);
    setAdminForm({
      fullName: '',
      email: '',
      password: '',
      companyId: companies[0]?.id || 1,
      status: 'ACTIVE',
    });
    setIsAdminModalOpen(true);
  };

  const handleOpenEditAdmin = (adm) => {
    setEditingAdmin(adm);
    setAdminForm({
      fullName: adm.fullName,
      email: adm.email,
      password: '',
      companyId: adm.companyId,
      status: adm.status,
    });
    setIsAdminModalOpen(true);
  };

  const handleSaveAdmin = (e) => {
    e.preventDefault();
    if (!adminForm.fullName.trim() || !adminForm.email.trim()) {
      showToast('Validation Error', 'Full Name and Corporate Email are required.', 'error');
      return;
    }

    const assignedCompany = companies.find((c) => c.id === Number(adminForm.companyId));
    const compName = assignedCompany ? assignedCompany.name : 'Unassigned';

    if (editingAdmin) {
      setAdmins((prev) =>
        prev.map((a) =>
          a.id === editingAdmin.id
            ? {
                ...a,
                fullName: adminForm.fullName,
                email: adminForm.email,
                companyId: Number(adminForm.companyId),
                companyName: compName,
                status: adminForm.status,
              }
            : a
        )
      );
      showToast('Admin Updated', `Facility admin ${adminForm.fullName} updated.`);
    } else {
      const newAdminId = admins.length > 0 ? Math.max(...admins.map((a) => a.id)) + 1 : 1;
      const newAdmin = {
        id: newAdminId,
        fullName: adminForm.fullName,
        email: adminForm.email,
        companyId: Number(adminForm.companyId),
        companyName: compName,
        role: 'COMPANY_ADMIN',
        status: adminForm.status,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: 'Never logged in',
      };
      setAdmins((prev) => [newAdmin, ...prev]);

      const newAudit = {
        id: Date.now(),
        action: 'CREATE_FACILITY_ADMIN',
        entityType: 'USER',
        entityName: newAdmin.email,
        performedBy: user?.email || 'superadmin@system.com',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        details: `Created Facility Admin credentials for ${newAdmin.fullName} (${compName})`,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
      showToast('Facility Admin Created', `Created and assigned admin for ${compName}.`);
    }

    setIsAdminModalOpen(false);
  };

  const handleToggleAdminStatus = (adminId) => {
    setAdmins((prev) =>
      prev.map((a) => {
        if (a.id === adminId) {
          const nextStatus = a.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          showToast(
            'Admin Access Updated',
            `${a.fullName} is now ${nextStatus.toLowerCase()}.`,
            nextStatus === 'ACTIVE' ? 'success' : 'warning'
          );
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  };

  // Filtered lists
  const filteredCompanies = companies.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
      c.companyCode.toLowerCase().includes(companySearch.toLowerCase()) ||
      (c.contactInformation && c.contactInformation.toLowerCase().includes(companySearch.toLowerCase()));
    const matchFilter = companyFilter === 'ALL' || c.status === companyFilter;
    return matchSearch && matchFilter;
  });

  const filteredAdmins = admins.filter((a) => {
    const matchSearch =
      a.fullName.toLowerCase().includes(adminSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(adminSearch.toLowerCase()) ||
      a.companyName.toLowerCase().includes(adminSearch.toLowerCase());
    const matchCompany =
      adminCompanyFilter === 'ALL' || String(a.companyId) === String(adminCompanyFilter);
    return matchSearch && matchCompany;
  });

  return (
    <div className="superadmin-portal" id="superadmin-console">
      <div className="container">
        {/* Metrics Bar */}
        <div className="superadmin-metrics-grid">
          <div className="metric-card">
            <div className="metric-card__icon metric-card__icon--blue">
              <Building2 size={24} />
            </div>
            <div className="metric-card__info">
              <span className="metric-card__label">Tenant Companies</span>
              <span className="metric-card__value">{companies.length}</span>
              <span className="metric-card__sub">
                {companies.filter((c) => c.status === 'ACTIVE').length} Active
              </span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-card__icon metric-card__icon--purple">
              <Users size={24} />
            </div>
            <div className="metric-card__info">
              <span className="metric-card__label">Facility Admins</span>
              <span className="metric-card__value">{admins.length}</span>
              <span className="metric-card__sub">
                {admins.filter((a) => a.status === 'ACTIVE').length} Active Accounts
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="superadmin-tabs">
          <button
            type="button"
            className={`superadmin-tab ${activeTab === 'companies' ? 'superadmin-tab--active' : ''}`}
            onClick={() => setActiveTab('companies')}
          >
            <Building2 size={16} />
            <span>Tenant Companies ({companies.length})</span>
          </button>
          <button
            type="button"
            className={`superadmin-tab ${activeTab === 'admins' ? 'superadmin-tab--active' : ''}`}
            onClick={() => setActiveTab('admins')}
          >
            <Users size={16} />
            <span>Facility Administrators ({admins.length})</span>
          </button>
          <button
            type="button"
            className={`superadmin-tab ${activeTab === 'audit' ? 'superadmin-tab--active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <FileText size={16} />
            <span>Audit & Activity Logs ({auditLogs.length})</span>
          </button>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`superadmin-toast superadmin-toast--${toast.type}`}>
            <CheckCircle2 size={18} />
            <div>
              <strong>{toast.title}</strong>
              <p>{toast.message}</p>
            </div>
            <button
              type="button"
              className="superadmin-toast__close"
              onClick={() => setToast(null)}
            >
              &times;
            </button>
          </div>
        )}

        {/* ═══════════════ TAB 1: COMPANIES MANAGEMENT ═══════════════ */}
        {activeTab === 'companies' && (
          <div className="superadmin-panel">
            <div className="superadmin-panel__bar">
              <div className="superadmin-search-wrap">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by company name, code, or contact..."
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  className="superadmin-input"
                />
              </div>

              <div className="superadmin-filter-group">
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="superadmin-select"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="INACTIVE">Inactive Only</option>
                </select>

                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={handleOpenCreateCompany}
                >
                  <Plus size={16} />
                  <span>Register Company</span>
                </button>
              </div>
            </div>

            {/* Companies Table */}
            <div className="table-responsive">
              <table className="superadmin-table">
                <thead>
                  <tr>
                    <th>Company Code</th>
                    <th>Company Name</th>
                    <th>Contact Information</th>
                    <th>Registered Office</th>
                    <th>Facility Admins</th>
                    <th>Status</th>
                    <th className="th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="td-empty">
                        No companies found matching your query.
                      </td>
                    </tr>
                  ) : (
                    filteredCompanies.map((c) => {
                      const compAdmins = admins.filter((a) => a.companyId === c.id);
                      return (
                        <tr key={c.id}>
                          <td>
                            <span className="code-pill">{c.companyCode}</span>
                          </td>
                          <td className="td-strong">
                            <Building2 size={16} className="inline-icon" />
                            {c.name}
                          </td>
                          <td>
                            <span className="contact-chip">
                              <Mail size={12} />
                              {c.contactInformation || 'No contact email'}
                            </span>
                          </td>
                          <td className="td-address">
                            <span className="address-snippet" title={c.address}>
                              <MapPin size={12} />
                              {c.address || 'Address not configured'}
                            </span>
                          </td>
                          <td>
                            <span className="admin-count-badge">
                              {compAdmins.length} Admin{compAdmins.length === 1 ? '' : 's'}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`status-pill ${
                                c.status === 'ACTIVE' ? 'status-pill--active' : 'status-pill--inactive'
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="td-actions">
                            <button
                              type="button"
                              className="action-btn action-btn--edit"
                              onClick={() => handleOpenEditCompany(c)}
                              title="Edit Company Details"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              className={`action-btn ${
                                c.status === 'ACTIVE' ? 'action-btn--deactivate' : 'action-btn--activate'
                              }`}
                              onClick={() => handleToggleCompanyStatus(c.id)}
                              title={c.status === 'ACTIVE' ? 'Deactivate Company' : 'Activate Company'}
                            >
                              {c.status === 'ACTIVE' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════════ TAB 2: FACILITY ADMINS MANAGEMENT ═══════════════ */}
        {activeTab === 'admins' && (
          <div className="superadmin-panel">
            <div className="superadmin-panel__bar">
              <div className="superadmin-search-wrap">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by admin name, email, or company..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="superadmin-input"
                />
              </div>

              <div className="superadmin-filter-group">
                <select
                  value={adminCompanyFilter}
                  onChange={(e) => setAdminCompanyFilter(e.target.value)}
                  className="superadmin-select"
                >
                  <option value="ALL">All Companies</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.companyCode})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={handleOpenCreateAdmin}
                >
                  <Plus size={16} />
                  <span>Create Facility Admin</span>
                </button>
              </div>
            </div>

            {/* Admins Table */}
            <div className="table-responsive">
              <table className="superadmin-table">
                <thead>
                  <tr>
                    <th>Administrator</th>
                    <th>Corporate Email</th>
                    <th>Assigned Company</th>
                    <th>Role Scope</th>
                    <th>Last Active</th>
                    <th>Status</th>
                    <th className="th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="td-empty">
                        No Facility Administrators found.
                      </td>
                    </tr>
                  ) : (
                    filteredAdmins.map((a) => (
                      <tr key={a.id}>
                        <td className="td-strong">
                          <div className="admin-user-cell">
                            <div className="admin-avatar">
                              {a.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="admin-name">{a.fullName}</span>
                              <span className="admin-id">User #{a.id}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="contact-chip">
                            <Mail size={12} />
                            {a.email}
                          </span>
                        </td>
                        <td>
                          <span className="company-badge">
                            <Building2 size={12} />
                            {a.companyName}
                          </span>
                        </td>
                        <td>
                          <span className="role-tag">COMPANY_ADMIN</span>
                        </td>
                        <td className="td-subtle">{a.lastLogin || 'Recent'}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              a.status === 'ACTIVE' ? 'status-pill--active' : 'status-pill--inactive'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="td-actions">
                          <button
                            type="button"
                            className="action-btn action-btn--edit"
                            onClick={() => handleOpenEditAdmin(a)}
                            title="Edit Administrator"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            className={`action-btn ${
                              a.status === 'ACTIVE' ? 'action-btn--deactivate' : 'action-btn--activate'
                            }`}
                            onClick={() => handleToggleAdminStatus(a.id)}
                            title={a.status === 'ACTIVE' ? 'Deactivate Admin' : 'Activate Admin'}
                          >
                            {a.status === 'ACTIVE' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════════ TAB 3: AUDIT LOGS ═══════════════ */}
        {activeTab === 'audit' && (
          <div className="superadmin-panel">
            <div className="superadmin-panel__bar">
              <h3 className="panel-subheading">System Configuration & Security Audit Trail</h3>
              <span className="audit-note">Retained independently under multi-tenant isolation</span>
            </div>

            <div className="table-responsive">
              <table className="superadmin-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Entity Type</th>
                    <th>Target</th>
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
        )}
      </div>

      {/* ═══════════════ MODAL: CREATE / EDIT COMPANY ═══════════════ */}
      {isCompanyModalOpen && (
        <div className="sa-modal-overlay" onClick={() => setIsCompanyModalOpen(false)}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal__header">
              <div className="sa-modal__title-group">
                <Building2 size={20} className="modal-title-icon" />
                <h3>{editingCompany ? 'Edit Tenant Company' : 'Register New Tenant Company'}</h3>
              </div>
              <button
                type="button"
                className="sa-modal__close"
                onClick={() => setIsCompanyModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="sa-modal__form">
              <div className="sa-form-grid">
                <div className="sa-form-group">
                  <label htmlFor="sa-comp-name">Company Name *</label>
                  <input
                    id="sa-comp-name"
                    type="text"
                    placeholder="e.g. Acme Corporation"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="sa-form-group">
                  <label htmlFor="sa-comp-code">Company Code (Unique) *</label>
                  <input
                    id="sa-comp-code"
                    type="text"
                    placeholder="e.g. ACME"
                    maxLength={10}
                    value={companyForm.companyCode}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, companyCode: e.target.value.toUpperCase() })
                    }
                    required
                  />
                </div>
              </div>

              <div className="sa-form-group">
                <label htmlFor="sa-comp-contact">Contact Email / Phone</label>
                <input
                  id="sa-comp-contact"
                  type="text"
                  placeholder="e.g. admin@acme.com or +1 800 555-0199"
                  value={companyForm.contactInformation}
                  onChange={(e) =>
                    setCompanyForm({ ...companyForm, contactInformation: e.target.value })
                  }
                />
              </div>

              <div className="sa-form-group">
                <label htmlFor="sa-comp-addr">Registered Campus Address</label>
                <textarea
                  id="sa-comp-addr"
                  rows={2}
                  placeholder="e.g. 100 Tech Park, Suite 400, Silicon Corridor"
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                />
              </div>

              <div className="sa-form-group">
                <label htmlFor="sa-comp-status">Initial Status</label>
                <select
                  id="sa-comp-status"
                  value={companyForm.status}
                  onChange={(e) => setCompanyForm({ ...companyForm, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE (Can book meeting rooms)</option>
                  <option value="INACTIVE">INACTIVE (Temporarily offline)</option>
                </select>
              </div>

              <div className="sa-modal__footer">
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => setIsCompanyModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary btn--sm">
                  {editingCompany ? 'Save Changes' : 'Register Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL: CREATE / EDIT FACILITY ADMIN ═══════════════ */}
      {isAdminModalOpen && (
        <div className="sa-modal-overlay" onClick={() => setIsAdminModalOpen(false)}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sa-modal__header">
              <div className="sa-modal__title-group">
                <Users size={20} className="modal-title-icon" />
                <h3>{editingAdmin ? 'Edit Facility Administrator' : 'Create Facility Administrator'}</h3>
              </div>
              <button
                type="button"
                className="sa-modal__close"
                onClick={() => setIsAdminModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveAdmin} className="sa-modal__form">
              <div className="sa-form-group">
                <label htmlFor="sa-adm-name">Administrator Full Name *</label>
                <input
                  id="sa-adm-name"
                  type="text"
                  placeholder="e.g. John Facility Manager"
                  value={adminForm.fullName}
                  onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="sa-form-group">
                <label htmlFor="sa-adm-email">Corporate Email Address *</label>
                <input
                  id="sa-adm-email"
                  type="email"
                  placeholder="e.g. admin@acme.com"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  required
                />
              </div>

              {!editingAdmin && (
                <div className="sa-form-group">
                  <label htmlFor="sa-adm-pwd">Initial Temporary Password *</label>
                  <input
                    id="sa-adm-pwd"
                    type="password"
                    placeholder="e.g. password123"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    required
                  />
                  <span className="sa-form-hint">
                    Hashed via BCrypt upon authentication. The admin can change this on first login.
                  </span>
                </div>
              )}

              <div className="sa-form-group">
                <label htmlFor="sa-adm-comp">Assign to Tenant Company *</label>
                <select
                  id="sa-adm-comp"
                  value={adminForm.companyId}
                  onChange={(e) => setAdminForm({ ...adminForm, companyId: e.target.value })}
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.companyCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sa-form-group">
                <label htmlFor="sa-adm-status">Account Status</label>
                <select
                  id="sa-adm-status"
                  value={adminForm.status}
                  onChange={(e) => setAdminForm({ ...adminForm, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE (Authorized to manage physical rooms)</option>
                  <option value="INACTIVE">INACTIVE (Login suspended)</option>
                </select>
              </div>

              <div className="sa-modal__footer">
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => setIsAdminModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary btn--sm">
                  {editingAdmin ? 'Save Changes' : 'Create Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
