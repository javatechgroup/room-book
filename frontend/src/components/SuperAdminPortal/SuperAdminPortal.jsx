import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { companyApi } from '../../api/companyApi';
import { adminApi } from '../../api/adminApi';
import { INITIAL_COMPANIES, INITIAL_ADMINS, INITIAL_AUDIT_LOGS } from './data/superAdminData';
import SuperAdminMetrics from './components/SuperAdminMetrics';
import SuperAdminTabs from './components/SuperAdminTabs';
import CompaniesTab from './components/CompaniesTab';
import AdminsTab from './components/AdminsTab';
import AuditLogsTab from './components/AuditLogsTab';
import CompanyInspectorDrawer from './components/CompanyInspectorDrawer';
import CompanyModal from './components/CompanyModal';
import AdminModal from './components/AdminModal';
import './SuperAdminPortal.css';

export default function SuperAdminPortal() {
  const { user } = useAuth();

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState('companies'); // 'companies' | 'admins' | 'audit'

  // Primary Data State
  const [companies, setCompanies] = useState(INITIAL_COMPANIES);
  const [admins, setAdmins] = useState(INITIAL_ADMINS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  // Tenant Companies Tab State
  const [companySearch, setCompanySearch] = useState('');
  const [companyStatusFilter, setCompanyStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [companySort, setCompanySort] = useState({ field: 'name', direction: 'asc' });
  const [companyPage, setCompanyPage] = useState(1);
  const [companyPageSize, setCompanyPageSize] = useState(10);
  const [totalCompaniesCount, setTotalCompaniesCount] = useState(0);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState([]);

  // Facility Admins Tab State
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCompanyFilter, setAdminCompanyFilter] = useState('ALL');
  const [adminStatusFilter, setAdminStatusFilter] = useState('ALL');
  const [adminSort, setAdminSort] = useState({ field: 'fullName', direction: 'asc' });
  const [adminPage, setAdminPage] = useState(1);
  const [adminPageSize, setAdminPageSize] = useState(10);
  const [totalAdminsCount, setTotalAdminsCount] = useState(0);

  // Slide-Over Detail Drawer State
  const [drawerCompany, setDrawerCompany] = useState(null);

  // Company Modal State
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyConflictSuggestions, setCompanyConflictSuggestions] = useState([]);
  const [companyModalError, setCompanyModalError] = useState('');
  const [companyForm, setCompanyForm] = useState({
    name: '',
    companyCode: '',
    contactInformation: '',
    phone: '',
    address: '',
    status: 'ACTIVE',
  });

  // Facility Admin Modal State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [adminForm, setAdminForm] = useState({
    fullName: '',
    email: '',
    password: '',
    companyId: 1,
    status: 'ACTIVE',
  });

  // Global Toast Hook
  const { toast } = useToast();
  const showToast = (title, message, type = 'success') => {
    if (type === 'error') toast.error(title, message);
    else if (type === 'warning') toast.warning(title, message);
    else if (type === 'info') toast.info(title, message);
    else toast.success(title, message);
  };

  // ════════════════════ SORTING & FILTERING ════════════════════

  const handleSortCompanies = (field) => {
    setCompanySort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setCompanyPage(1);
  };

  const handleSortAdmins = (field) => {
    setAdminSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setAdminPage(1);
  };

  // Filtered & Sorted Companies
  const filteredAndSortedCompanies = useMemo(() => {
    let list = companies.filter((c) => {
      const q = companySearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.companyCode.toLowerCase().includes(q) ||
        (c.contactInformation && c.contactInformation.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q));

      const matchStatus =
        companyStatusFilter === 'ALL' || c.status === companyStatusFilter;

      return matchSearch && matchStatus;
    });

    list.sort((a, b) => {
      let valA = a[companySort.field] || '';
      let valB = b[companySort.field] || '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return companySort.direction === 'asc' ? -1 : 1;
      if (valA > valB) return companySort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [companies, companySearch, companyStatusFilter, companySort]);

  const paginatedCompanies = useMemo(() => {
    if (totalCompaniesCount > 0) {
      return companies;
    }
    const start = (companyPage - 1) * companyPageSize;
    return filteredAndSortedCompanies.slice(start, start + companyPageSize);
  }, [companies, filteredAndSortedCompanies, companyPage, companyPageSize, totalCompaniesCount]);

  // Filtered & Sorted Admins
  const filteredAndSortedAdmins = useMemo(() => {
    let list = admins.filter((a) => {
      const q = adminSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        a.fullName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.companyName.toLowerCase().includes(q);

      const matchCompany =
        adminCompanyFilter === 'ALL' || String(a.companyId) === String(adminCompanyFilter);

      const matchStatus =
        adminStatusFilter === 'ALL' || a.status === adminStatusFilter;

      return matchSearch && matchCompany && matchStatus;
    });

    list.sort((a, b) => {
      let valA = a[adminSort.field] || '';
      let valB = b[adminSort.field] || '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return adminSort.direction === 'asc' ? -1 : 1;
      if (valA > valB) return adminSort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [admins, adminSearch, adminCompanyFilter, adminStatusFilter, adminSort]);

  const paginatedAdmins = useMemo(() => {
    if (totalAdminsCount > 0) {
      return admins;
    }
    const start = (adminPage - 1) * adminPageSize;
    return filteredAndSortedAdmins.slice(start, start + adminPageSize);
  }, [admins, filteredAndSortedAdmins, adminPage, adminPageSize, totalAdminsCount]);

  // Data loading for Facility Administrators with database pagination & filtering
  useEffect(() => {
    let isMounted = true;
    const fetchLiveAdmins = async () => {
      const res = await adminApi.getAdmins({
        page: adminPage,
        size: adminPageSize,
        search: adminSearch,
        companyFilter: adminCompanyFilter,
        status: adminStatusFilter,
        sortBy: adminSort.field,
        sortDir: adminSort.direction,
      });
      if (isMounted && res.success && Array.isArray(res.data)) {
        setAdmins(res.data);
        if (typeof res.totalElements === 'number') {
          setTotalAdminsCount(res.totalElements);
        }
      }
    };
    fetchLiveAdmins();
    return () => {
      isMounted = false;
    };
  }, [adminPage, adminPageSize, adminSearch, adminCompanyFilter, adminStatusFilter, adminSort]);

  // ════════════════════ SELECTION & BULK ACTIONS ════════════════════

  const handleSelectAllCompaniesOnPage = (e) => {
    if (e.target.checked) {
      const pageIds = paginatedCompanies.map((c) => c.id);
      setSelectedCompanyIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = new Set(paginatedCompanies.map((c) => c.id));
      setSelectedCompanyIds((prev) => prev.filter((id) => !pageIds.has(id)));
    }
  };

  const handleToggleSelectCompany = (id) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isAllCompaniesPageSelected =
    paginatedCompanies.length > 0 &&
    paginatedCompanies.every((c) => selectedCompanyIds.includes(c.id));

  const handleBulkActivateCompanies = () => {
    setCompanies((prev) =>
      prev.map((c) => (selectedCompanyIds.includes(c.id) ? { ...c, status: 'ACTIVE' } : c))
    );
    showToast('Bulk Action Complete', `Activated ${selectedCompanyIds.length} tenant companies.`);
    setSelectedCompanyIds([]);
  };

  const handleBulkDeactivateCompanies = () => {
    setCompanies((prev) =>
      prev.map((c) => (selectedCompanyIds.includes(c.id) ? { ...c, status: 'INACTIVE' } : c))
    );
    showToast(
      'Bulk Action Complete',
      `Deactivated ${selectedCompanyIds.length} tenant companies.`,
      'warning'
    );
    setSelectedCompanyIds([]);
  };

  const handleExportCompaniesCSV = () => {
    const targetList =
      selectedCompanyIds.length > 0
        ? companies.filter((c) => selectedCompanyIds.includes(c.id))
        : filteredAndSortedCompanies;

    const headers = ['ID', 'Company Code', 'Company Name', 'Contact Email', 'Phone', 'Address', 'Status', 'Created Date'];
    const rows = targetList.map((c) => [
      c.id,
      c.companyCode,
      `"${c.name.replace(/"/g, '""')}"`,
      c.contactInformation || '',
      c.phone || '',
      `"${(c.address || '').replace(/"/g, '""')}"`,
      c.status,
      c.createdAt,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tenant-companies-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Export Successful', `Exported ${targetList.length} companies to CSV.`);
  };

  // ════════════════════ DRAWER & NAVIGATION ════════════════════

  const handleViewCompanyAdmins = (companyId) => {
    setDrawerCompany(null);
    setActiveTab('admins');
    setAdminCompanyFilter(String(companyId));
    setAdminSearch('');
    setAdminPage(1);
  };

  // ════════════════════ COMPANY CRUD ════════════════════

  const handleOpenCreateCompany = () => {
    setEditingCompany(null);
    setCompanyConflictSuggestions([]);
    setCompanyModalError('');
    setCompanyForm({
      name: '',
      companyCode: '',
      contactInformation: '',
      phone: '',
      address: '',
      status: 'ACTIVE',
    });
    setIsCompanyModalOpen(true);
  };

  // Data loading with database pagination & filtering
  useEffect(() => {
    let isMounted = true;
    const fetchLiveCompanies = async () => {
      const res = await companyApi.getCompanies({
        page: companyPage,
        size: companyPageSize,
        search: companySearch,
        status: companyStatusFilter,
        sortBy: companySort.field,
        sortDir: companySort.direction,
      });
      if (isMounted && res.success && Array.isArray(res.data)) {
        setCompanies(res.data);
        if (typeof res.totalElements === 'number') {
          setTotalCompaniesCount(res.totalElements);
        }
      }
    };
    fetchLiveCompanies();
    return () => {
      isMounted = false;
    };
  }, [companyPage, companyPageSize, companySearch, companyStatusFilter, companySort]);

  const handleOpenEditCompany = (comp) => {
    setEditingCompany(comp);
    setCompanyConflictSuggestions([]);
    setCompanyModalError('');
    setCompanyForm({
      name: comp.name,
      companyCode: comp.companyCode,
      contactInformation: comp.contactInformation || '',
      phone: comp.phone || '',
      address: comp.address || '',
      status: comp.status,
    });
    setIsCompanyModalOpen(true);
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (editingCompany) {
      const res = await companyApi.updateCompany(editingCompany.id, companyForm);
      if (res.success && res.data) {
        setCompanies((prev) =>
          prev.map((c) => (c.id === editingCompany.id ? { ...c, ...res.data } : c))
        );
        if (drawerCompany && drawerCompany.id === editingCompany.id) {
          setDrawerCompany((prev) => ({ ...prev, ...res.data }));
        }
        showToast('Tenant Updated', `Company details for "${companyForm.name}" updated successfully.`);
        setCompanyConflictSuggestions([]);
        setCompanyModalError('');
        setIsCompanyModalOpen(false);
      } else {
        if (user?.isDemoSession || !res.error) {
          setCompanies((prev) =>
            prev.map((c) => (c.id === editingCompany.id ? { ...c, ...companyForm } : c))
          );
          if (drawerCompany && drawerCompany.id === editingCompany.id) {
            setDrawerCompany((prev) => ({ ...prev, ...companyForm }));
          }
          showToast('Tenant Updated', `Company details for "${companyForm.name}" updated.`);
          setCompanyConflictSuggestions([]);
          setCompanyModalError('');
          setIsCompanyModalOpen(false);
        } else {
          showToast('Update Failed', res.error, 'error');
        }
      }
    } else {
      const res = await companyApi.createCompany(companyForm);
      if (res.success && res.data) {
        const newComp = res.data;
        setCompanies((prev) => [newComp, ...prev]);

        setAuditLogs((prev) => [
          {
            id: Date.now(),
            action: 'REGISTER_TENANT',
            entityType: 'COMPANY',
            entityName: newComp.name,
            performedBy: user?.email || 'superadmin@system.com',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            details: `Provisioned new company code ${newComp.companyCode} with initial physical room quotas`,
          },
          ...prev,
        ]);

        showToast('Tenant Registered', `New organization "${companyForm.name}" has been registered.`);
        setCompanyConflictSuggestions([]);
        setCompanyModalError('');
        setIsCompanyModalOpen(false);
      } else {
        if (user?.isDemoSession) {
          const newId = Math.max(...companies.map((c) => c.id), 0) + 1;
          const newComp = {
            ...companyForm,
            id: newId,
            createdAt: new Date().toISOString().split('T')[0],
            departmentsCount: 1,
            roomsCount: 0,
            adminsCount: 0,
          };
          setCompanies((prev) => [newComp, ...prev]);
          showToast('Tenant Registered (Demo)', `New organization "${companyForm.name}" provisioned.`);
          setCompanyConflictSuggestions([]);
          setCompanyModalError('');
          setIsCompanyModalOpen(false);
        } else {
          setCompanyConflictSuggestions(res.suggestedCodes || []);
          setCompanyModalError(res.error || 'Company registration failed');
          showToast('Registration Conflict', res.error, 'error');
        }
      }
    }
  };

  const handleToggleCompanyStatus = async (companyId) => {
    const targetComp = companies.find((c) => c.id === companyId);
    if (!targetComp) return;

    const nextStatus = targetComp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const res = await companyApi.toggleCompanyStatus(companyId);
    const resolvedStatus = res.success && res.data?.status ? res.data.status : nextStatus;

    setCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, status: resolvedStatus } : c))
    );

    if (drawerCompany && drawerCompany.id === companyId) {
      setDrawerCompany((prev) => (prev ? { ...prev, status: resolvedStatus } : null));
    }

    if (resolvedStatus === 'ACTIVE') {
      showToast(
        'Tenant Activated',
        `Tenant "${targetComp.name}" has been successfully activated.`,
        'success'
      );
    } else {
      showToast(
        'Tenant Suspended',
        `Tenant "${targetComp.name}" has been suspended and marked inactive.`,
        'warning'
      );
    }
  };

  // ════════════════════ ADMIN CRUD ════════════════════

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

  const handleOpenEditAdmin = (admin) => {
    setEditingAdmin(admin);
    setAdminForm({
      fullName: admin.fullName,
      email: admin.email,
      password: '',
      companyId: admin.companyId,
      status: admin.status,
    });
    setIsAdminModalOpen(true);
  };

  const handleSaveAdmin = async (e) => {
    e.preventDefault();
    const assignedCompany = companies.find((c) => String(c.id) === String(adminForm.companyId));
    const companyName = assignedCompany ? assignedCompany.name : 'Unassigned';

    if (editingAdmin) {
      const res = await adminApi.updateAdmin(editingAdmin.id, adminForm);
      if (res.success && res.data) {
        setAdmins((prev) =>
          prev.map((a) => (a.id === editingAdmin.id ? { ...a, ...res.data } : a))
        );
        showToast('Admin Updated', `Updated account for ${adminForm.fullName}.`);
        setIsAdminModalOpen(false);
      } else {
        if (user?.isDemoSession || !res.error) {
          setAdmins((prev) =>
            prev.map((a) =>
              a.id === editingAdmin.id
                ? {
                    ...a,
                    fullName: adminForm.fullName,
                    email: adminForm.email,
                    companyId: Number(adminForm.companyId),
                    companyName,
                    status: adminForm.status,
                  }
                : a
            )
          );
          showToast('Admin Updated', `Updated account for ${adminForm.fullName}.`);
          setIsAdminModalOpen(false);
        } else {
          showToast('Update Failed', res.error, 'error');
        }
      }
    } else {
      const res = await adminApi.createAdmin(adminForm);
      if (res.success && res.data) {
        const newAdmin = res.data;
        setAdmins((prev) => [newAdmin, ...prev]);

        setAuditLogs((prev) => [
          {
            id: Date.now(),
            action: 'CREATE_FACILITY_ADMIN',
            entityType: 'USER',
            entityName: newAdmin.email,
            performedBy: user?.email || 'superadmin@system.com',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            details: `Provisioned Facility Administrator account for ${newAdmin.fullName} (${companyName})`,
          },
          ...prev,
        ]);

        showToast('Admin Created', `Administrator credentials created for ${adminForm.fullName}.`);
        setIsAdminModalOpen(false);
      } else {
        if (user?.isDemoSession) {
          const newId = Math.max(...admins.map((a) => a.id), 0) + 1;
          const newAdmin = {
            ...adminForm,
            id: newId,
            companyId: Number(adminForm.companyId),
            companyName,
            role: 'COMPANY_ADMIN',
            status: adminForm.status,
            createdAt: new Date().toISOString().split('T')[0],
            lastLogin: 'Never',
          };
          setAdmins((prev) => [newAdmin, ...prev]);
          showToast('Admin Created (Demo)', `Administrator credentials created for ${adminForm.fullName}.`);
          setIsAdminModalOpen(false);
        } else {
          showToast('Creation Failed', res.error, 'error');
        }
      }
    }
  };

  const handleToggleAdminStatus = async (adminId) => {
    const targetAdmin = admins.find((a) => a.id === adminId);
    if (!targetAdmin) return;

    const nextStatus = targetAdmin.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const res = await adminApi.toggleAdminStatus(adminId);
    const resolvedStatus = res.success && res.data?.status ? res.data.status : nextStatus;

    setAdmins((prev) =>
      prev.map((a) => (a.id === adminId ? { ...a, status: resolvedStatus } : a))
    );

    if (resolvedStatus === 'ACTIVE') {
      showToast(
        'Admin Access Activated',
        `Administrator "${targetAdmin.fullName}" access is now active.`,
        'success'
      );
    } else {
      showToast(
        'Admin Access Suspended',
        `Administrator "${targetAdmin.fullName}" access has been suspended.`,
        'warning'
      );
    }
  };

  const activeCompaniesCount = companies.filter((c) => c.status === 'ACTIVE').length;
  const activeAdminsCount = admins.filter((a) => a.status === 'ACTIVE').length;

  return (
    <div className="superadmin-portal" id="superadmin-console">
      <div className="container">
        {/* Top Focused Metrics */}
        <SuperAdminMetrics companies={companies} admins={admins} />

        {/* Navigation Tabs */}
        <SuperAdminTabs
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'companies') setSelectedCompanyIds([]);
          }}
          companiesCount={totalCompaniesCount > 0 ? totalCompaniesCount : companies.length}
          adminsCount={totalAdminsCount > 0 ? totalAdminsCount : admins.length}
          auditLogsCount={auditLogs.length}
          onOpenCreateCompany={handleOpenCreateCompany}
          onOpenCreateAdmin={handleOpenCreateAdmin}
        />

        {/* Tab 1: Tenant Companies */}
        {activeTab === 'companies' && (
          <CompaniesTab
            companies={companies}
            activeCompaniesCount={activeCompaniesCount}
            paginatedCompanies={paginatedCompanies}
            totalFilteredCount={totalCompaniesCount > 0 ? totalCompaniesCount : filteredAndSortedCompanies.length}
            search={companySearch}
            onSearchSubmit={(val) => {
              setCompanySearch(val);
              setCompanyPage(1);
            }}
            statusFilter={companyStatusFilter}
            onStatusFilterChange={(val) => {
              setCompanyStatusFilter(val);
              setCompanyPage(1);
            }}
            sort={companySort}
            onSort={handleSortCompanies}
            selectedIds={selectedCompanyIds}
            onToggleSelect={handleToggleSelectCompany}
            onSelectAllPage={handleSelectAllCompaniesOnPage}
            isAllPageSelected={isAllCompaniesPageSelected}
            admins={admins}
            onInspect={(comp) => setDrawerCompany(comp)}
            onEdit={handleOpenEditCompany}
            onToggleStatus={handleToggleCompanyStatus}
            onViewAdmins={handleViewCompanyAdmins}
            onBulkActivate={handleBulkActivateCompanies}
            onBulkDeactivate={handleBulkDeactivateCompanies}
            onBulkExport={handleExportCompaniesCSV}
            onBulkClear={() => setSelectedCompanyIds([])}
            onExportCSV={handleExportCompaniesCSV}
            currentPage={companyPage}
            pageSize={companyPageSize}
            onPageChange={setCompanyPage}
            onPageSizeChange={(newSize) => {
              setCompanyPageSize(newSize);
              setCompanyPage(1);
            }}
          />
        )}

        {/* Tab 2: Facility Administrators */}
        {activeTab === 'admins' && (
          <AdminsTab
            admins={admins}
            activeAdminsCount={activeAdminsCount}
            companies={companies}
            paginatedAdmins={paginatedAdmins}
            totalFilteredCount={totalAdminsCount > 0 ? totalAdminsCount : filteredAndSortedAdmins.length}
            search={adminSearch}
            onSearchSubmit={(val) => {
              setAdminSearch(val);
              setAdminPage(1);
            }}
            companyFilter={adminCompanyFilter}
            onCompanyFilterChange={(val) => {
              setAdminCompanyFilter(val);
              setAdminPage(1);
            }}
            statusFilter={adminStatusFilter}
            onStatusFilterChange={(val) => {
              setAdminStatusFilter(val);
              setAdminPage(1);
            }}
            sort={adminSort}
            onSort={handleSortAdmins}
            onEdit={handleOpenEditAdmin}
            onToggleStatus={handleToggleAdminStatus}
            currentPage={adminPage}
            pageSize={adminPageSize}
            onPageChange={setAdminPage}
            onPageSizeChange={(newSize) => {
              setAdminPageSize(newSize);
              setAdminPage(1);
            }}
          />
        )}

        {/* Tab 3: System Audit Logs */}
        {activeTab === 'audit' && <AuditLogsTab auditLogs={auditLogs} />}
      </div>

      {/* Slide-Over Drawer: Company Inspector */}
      <CompanyInspectorDrawer
        company={drawerCompany}
        admins={admins}
        onClose={() => setDrawerCompany(null)}
        onEdit={handleOpenEditCompany}
        onToggleStatus={handleToggleCompanyStatus}
        onViewAdmins={handleViewCompanyAdmins}
      />

      {/* Modal: Create / Edit Company */}
      <CompanyModal
        isOpen={isCompanyModalOpen}
        editingCompany={editingCompany}
        form={companyForm}
        onChange={setCompanyForm}
        onClose={() => setIsCompanyModalOpen(false)}
        onSave={handleSaveCompany}
        externalSuggestions={companyConflictSuggestions}
        errorMessage={companyModalError}
      />

      {/* Modal: Create / Edit Facility Administrator */}
      <AdminModal
        isOpen={isAdminModalOpen}
        editingAdmin={editingAdmin}
        form={adminForm}
        onChange={setAdminForm}
        onClose={() => setIsAdminModalOpen(false)}
        onSave={handleSaveAdmin}
        companies={companies}
      />
    </div>
  );
}
