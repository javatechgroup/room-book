import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { companyApi } from '../../api/companyApi';
import { adminApi } from '../../api/adminApi';
import { auditApi } from '../../api/auditApi';
import { INITIAL_COMPANIES, INITIAL_ADMINS, INITIAL_AUDIT_LOGS } from './data/superAdminData';
import SuperAdminMetrics from './components/SuperAdminMetrics';
import SuperAdminTabs from './components/SuperAdminTabs';
import CompaniesTab from './components/CompaniesTab';
import AdminsTab from './components/AdminsTab';
import AuditLogsTab from './components/AuditLogsTab';
import CompanyInspectorDrawer from './components/CompanyInspectorDrawer';
import CompanyModal from './components/CompanyModal';
import AdminModal from './components/AdminModal';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
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
  const [selectedAdminIds, setSelectedAdminIds] = useState([]);

  // System Audit Logs Tab State
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');
  const [auditEntityTypeFilter, setAuditEntityTypeFilter] = useState('ALL');
  const [auditSort, setAuditSort] = useState({ field: 'timestamp', direction: 'desc' });
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(10);
  const [totalAuditLogsCount, setTotalAuditLogsCount] = useState(0);
  const [availableAuditActions, setAvailableAuditActions] = useState([]);

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

  // Universal Confirmation Hook
  const { confirm } = useConfirm();

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

  const handleSortAuditLogs = (field) => {
    setAuditSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setAuditPage(1);
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

  // ════════════════════ UNIFIED DATA LOADERS & ON-DEMAND FETCHING ════════════════════

  const fetchCompanies = useCallback(async (overrides = {}) => {
    const page = overrides.page !== undefined ? overrides.page : companyPage;
    const size = overrides.size !== undefined ? overrides.size : companyPageSize;
    const search = overrides.search !== undefined ? overrides.search : companySearch;
    const status = overrides.status !== undefined ? overrides.status : companyStatusFilter;
    const sortBy = overrides.sortBy !== undefined ? overrides.sortBy : companySort.field;
    const sortDir = overrides.sortDir !== undefined ? overrides.sortDir : companySort.direction;

    const res = await companyApi.getCompanies({
      page,
      size,
      search,
      status,
      sortBy,
      sortDir,
    });
    if (res.success && Array.isArray(res.data)) {
      setCompanies(res.data);
      if (typeof res.totalElements === 'number') {
        setTotalCompaniesCount(res.totalElements);
      }
    }
    return res;
  }, [companyPage, companyPageSize, companySearch, companyStatusFilter, companySort]);

  const fetchAdmins = useCallback(async (overrides = {}) => {
    const page = overrides.page !== undefined ? overrides.page : adminPage;
    const size = overrides.size !== undefined ? overrides.size : adminPageSize;
    const search = overrides.search !== undefined ? overrides.search : adminSearch;
    const companyFilter = overrides.companyFilter !== undefined ? overrides.companyFilter : adminCompanyFilter;
    const status = overrides.status !== undefined ? overrides.status : adminStatusFilter;
    const sortBy = overrides.sortBy !== undefined ? overrides.sortBy : adminSort.field;
    const sortDir = overrides.sortDir !== undefined ? overrides.sortDir : adminSort.direction;

    const res = await adminApi.getAdmins({
      page,
      size,
      search,
      companyFilter,
      status,
      sortBy,
      sortDir,
    });
    if (res.success && Array.isArray(res.data)) {
      setAdmins(res.data);
      if (typeof res.totalElements === 'number') {
        setTotalAdminsCount(res.totalElements);
      }
    }
    return res;
  }, [adminPage, adminPageSize, adminSearch, adminCompanyFilter, adminStatusFilter, adminSort]);

  const fetchAuditLogs = useCallback(async (overrides = {}) => {
    const page = overrides.page !== undefined ? overrides.page : auditPage;
    const size = overrides.size !== undefined ? overrides.size : auditPageSize;
    const search = overrides.search !== undefined ? overrides.search : auditSearch;
    const action = overrides.action !== undefined ? overrides.action : auditActionFilter;
    const entityType = overrides.entityType !== undefined ? overrides.entityType : auditEntityTypeFilter;
    const sortBy = overrides.sortBy !== undefined ? overrides.sortBy : auditSort.field;
    const sortDir = overrides.sortDir !== undefined ? overrides.sortDir : auditSort.direction;

    const res = await auditApi.getAuditLogs({
      page,
      size,
      search,
      action,
      entityType,
      sortBy,
      sortDir,
    });
    if (res.success && Array.isArray(res.data)) {
      setAuditLogs(res.data);
      if (typeof res.totalElements === 'number') {
        setTotalAuditLogsCount(res.totalElements);
      }
    }
    return res;
  }, [auditPage, auditPageSize, auditSearch, auditActionFilter, auditEntityTypeFilter, auditSort]);

  const fetchAuditActions = useCallback(async () => {
    const res = await auditApi.getAuditActions();
    if (res.success && Array.isArray(res.data)) {
      setAvailableAuditActions(res.data);
    }
    return res;
  }, []);

  // Helper to refresh all related data across all tabs whenever any mutation occurs
  const refreshAllTabsData = useCallback(async () => {
    return Promise.all([
      fetchCompanies(),
      fetchAdmins(),
      fetchAuditLogs(),
      fetchAuditActions(),
    ]);
  }, [fetchCompanies, fetchAdmins, fetchAuditLogs, fetchAuditActions]);

  // Tab switch & on-demand load on click
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    if (tab === 'companies') {
      setSelectedCompanyIds([]);
      fetchCompanies();
    } else if (tab === 'admins') {
      setSelectedAdminIds([]);
      fetchAdmins();
      fetchCompanies(); // Keep companies list refreshed for dropdowns/filters
    } else if (tab === 'audit') {
      fetchAuditLogs();
      fetchAuditActions();
    }
  }, [fetchCompanies, fetchAdmins, fetchAuditLogs, fetchAuditActions]);

  // Reactive data synchronization on filter / page / sort changes
  useEffect(() => {
    if (activeTab === 'companies') {
      fetchCompanies();
    }
  }, [companyPage, companyPageSize, companySearch, companyStatusFilter, companySort, activeTab, fetchCompanies]);

  useEffect(() => {
    if (activeTab === 'admins') {
      fetchAdmins();
    }
  }, [adminPage, adminPageSize, adminSearch, adminCompanyFilter, adminStatusFilter, adminSort, activeTab, fetchAdmins]);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [auditPage, auditPageSize, auditSearch, auditActionFilter, auditEntityTypeFilter, auditSort, activeTab, fetchAuditLogs]);

  // Initial load on mount: fetch active tab + background summary for badges/metrics
  useEffect(() => {
    fetchCompanies();
    fetchAdmins();
    fetchAuditLogs();
    fetchAuditActions();
  }, []);

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

  const handleBulkActivateCompanies = async () => {
    if (selectedCompanyIds.length === 0) return;
    const targetIds = [...selectedCompanyIds];

    const res = await companyApi.bulkUpdateCompanyStatus(targetIds, 'ACTIVE');

    showToast('Bulk Action Complete', `Activated ${targetIds.length} tenant companies.`);
    setSelectedCompanyIds([]);

    await refreshAllTabsData();
  };

  const handleBulkDeactivateCompanies = async () => {
    if (selectedCompanyIds.length === 0) return;
    const targetIds = [...selectedCompanyIds];

    const ok = await confirm({
      title: 'Bulk Deactivate Companies?',
      subtitle: 'Tenant Organization Management',
      message: `You are about to suspend access for ${targetIds.length} selected tenant companies. All associated facility administrators, staff, and active room reservations under these organizations will be impacted immediately.`,
      targetName: `${targetIds.length} Companies Selected`,
      targetSub: 'Status will transition to Inactive / Suspended',
      confirmText: 'Deactivate Selected',
      type: 'danger',
    });

    if (!ok) return;

    const res = await companyApi.bulkUpdateCompanyStatus(targetIds, 'INACTIVE');

    showToast(
      'Bulk Action Complete',
      `Deactivated ${targetIds.length} tenant companies.`,
      'warning'
    );
    setSelectedCompanyIds([]);

    await refreshAllTabsData();
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
      `"${formatDate(c.createdAt)}"`,
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

  // Facility Admin Bulk Selection & Operations
  const handleSelectAllAdminsOnPage = (e) => {
    if (e.target.checked) {
      const pageIds = paginatedAdmins.map((a) => a.id);
      setSelectedAdminIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = new Set(paginatedAdmins.map((a) => a.id));
      setSelectedAdminIds((prev) => prev.filter((id) => !pageIds.has(id)));
    }
  };

  const handleToggleSelectAdmin = (id) => {
    setSelectedAdminIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isAllAdminsPageSelected =
    paginatedAdmins.length > 0 &&
    paginatedAdmins.every((a) => selectedAdminIds.includes(a.id));

  const handleBulkActivateAdmins = async () => {
    if (selectedAdminIds.length === 0) return;
    const targetIds = [...selectedAdminIds];

    const res = await adminApi.bulkUpdateAdminStatus(targetIds, 'ACTIVE');

    showToast('Bulk Action Complete', `Activated ${targetIds.length} facility administrators.`);
    setSelectedAdminIds([]);

    await refreshAllTabsData();
  };

  const handleBulkDeactivateAdmins = async () => {
    if (selectedAdminIds.length === 0) return;
    const targetIds = [...selectedAdminIds];

    const ok = await confirm({
      title: 'Bulk Suspend Administrators?',
      subtitle: 'Facility Administrator Management',
      message: `You are about to suspend access for ${targetIds.length} selected facility administrators. They will be locked out of facility management until reactivated.`,
      targetName: `${targetIds.length} Administrators Selected`,
      targetSub: 'Status will transition to Inactive / Suspended',
      confirmText: 'Suspend Selected',
      type: 'danger',
    });

    if (!ok) return;

    const res = await adminApi.bulkUpdateAdminStatus(targetIds, 'INACTIVE');

    showToast(
      'Bulk Action Complete',
      `Suspended ${targetIds.length} facility administrators.`,
      'warning'
    );
    setSelectedAdminIds([]);

    await refreshAllTabsData();
  };

  const handleExportAdminsCSV = () => {
    const targetList =
      selectedAdminIds.length > 0
        ? admins.filter((a) => selectedAdminIds.includes(a.id))
        : filteredAndSortedAdmins;

    const headers = ['ID', 'Full Name', 'Email', 'Company', 'Role', 'Status', 'Created Date'];
    const rows = targetList.map((a) => [
      a.id,
      `"${a.fullName.replace(/"/g, '""')}"`,
      a.email,
      `"${(a.companyName || '').replace(/"/g, '""')}"`,
      a.role,
      a.status,
      `"${formatDate(a.createdAt)}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `facility-admins-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Export Successful', `Exported ${targetList.length} administrators to CSV.`);
  };

  const handleExportAuditLogsCSV = () => {
    const targetList = auditLogs;
    const headers = ['ID', 'Timestamp', 'Action', 'Entity Type', 'Entity Name', 'Performed By', 'Company', 'Details', 'Old Value', 'New Value'];
    const rows = targetList.map((log) => [
      log.id,
      `"${formatDateTime(log.timestamp || log.formattedTimestamp, { showSeconds: true })}"`,
      log.action,
      log.entityType,
      `"${(log.entityName || '').replace(/"/g, '""')}"`,
      `"${(log.performedBy || '').replace(/"/g, '""')}"`,
      `"${(log.companyName || '').replace(/"/g, '""')}"`,
      `"${(log.details || '').replace(/"/g, '""')}"`,
      `"${(log.oldValue || '').replace(/"/g, '""')}"`,
      `"${(log.newValue || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `system-audit-logs-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Export Successful', `Exported ${targetList.length} audit trail records to CSV.`);
  };

  // ════════════════════ DRAWER & NAVIGATION ════════════════════

  const handleViewCompanyAdmins = (companyId) => {
    setDrawerCompany(null);
    setActiveTab('admins');
    setAdminCompanyFilter(String(companyId));
    setAdminSearch('');
    setAdminPage(1);
    fetchAdmins({ companyFilter: String(companyId), search: '', page: 1 });
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
        if (drawerCompany && drawerCompany.id === editingCompany.id) {
          setDrawerCompany((prev) => ({ ...prev, ...res.data }));
        }
        showToast('Tenant Updated', `Company details for "${companyForm.name}" updated successfully.`);
        setCompanyConflictSuggestions([]);
        setCompanyModalError('');
        setIsCompanyModalOpen(false);
        await refreshAllTabsData();
      } else {
        if (user?.isDemoSession || !res.error) {
          if (drawerCompany && drawerCompany.id === editingCompany.id) {
            setDrawerCompany((prev) => ({ ...prev, ...companyForm }));
          }
          showToast('Tenant Updated', `Company details for "${companyForm.name}" updated.`);
          setCompanyConflictSuggestions([]);
          setCompanyModalError('');
          setIsCompanyModalOpen(false);
          await refreshAllTabsData();
        } else {
          showToast('Update Failed', res.error, 'error');
        }
      }
    } else {
      const res = await companyApi.createCompany(companyForm);
      if (res.success && res.data) {
        showToast('Tenant Registered', `New organization "${companyForm.name}" has been registered.`);
        setCompanyConflictSuggestions([]);
        setCompanyModalError('');
        setIsCompanyModalOpen(false);
        await refreshAllTabsData();
      } else {
        if (user?.isDemoSession) {
          showToast('Tenant Registered (Demo)', `New organization "${companyForm.name}" provisioned.`);
          setCompanyConflictSuggestions([]);
          setCompanyModalError('');
          setIsCompanyModalOpen(false);
          await refreshAllTabsData();
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

    if (targetComp.status === 'ACTIVE') {
      const ok = await confirm({
        title: 'Suspend Tenant Organization?',
        subtitle: 'Company Status Management',
        message: `Are you sure you want to deactivate "${targetComp.name}"? Facility administrators and employees from this organization will no longer be able to schedule rooms or manage facilities while suspended.`,
        targetName: targetComp.name,
        targetSub: `Code: ${targetComp.companyCode} • ID: #${targetComp.id}`,
        confirmText: 'Suspend Company',
        type: 'danger',
      });
      if (!ok) return;
    }

    const res = await companyApi.toggleCompanyStatus(companyId);
    const resolvedStatus = res.success && res.data?.status ? res.data.status : (targetComp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');

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

    await refreshAllTabsData();
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
    if (editingAdmin) {
      const res = await adminApi.updateAdmin(editingAdmin.id, adminForm);
      if (res.success && res.data) {
        showToast('Admin Updated', `Updated account for ${adminForm.fullName}.`);
        setIsAdminModalOpen(false);
        await refreshAllTabsData();
      } else {
        if (user?.isDemoSession || !res.error) {
          showToast('Admin Updated', `Updated account for ${adminForm.fullName}.`);
          setIsAdminModalOpen(false);
          await refreshAllTabsData();
        } else {
          showToast('Update Failed', res.error, 'error');
        }
      }
    } else {
      const res = await adminApi.createAdmin(adminForm);
      if (res.success && res.data) {
        showToast('Admin Created', `Administrator credentials created for ${adminForm.fullName}.`);
        setIsAdminModalOpen(false);
        await refreshAllTabsData();
      } else {
        if (user?.isDemoSession) {
          showToast('Admin Created (Demo)', `Administrator credentials created for ${adminForm.fullName}.`);
          setIsAdminModalOpen(false);
          await refreshAllTabsData();
        } else {
          showToast('Creation Failed', res.error, 'error');
        }
      }
    }
  };

  const handleToggleAdminStatus = async (adminId) => {
    const targetAdmin = admins.find((a) => a.id === adminId);
    if (!targetAdmin) return;

    if (targetAdmin.status === 'ACTIVE') {
      const ok = await confirm({
        title: 'Suspend Administrator Access?',
        subtitle: 'Facility Administrator Management',
        message: `Are you sure you want to deactivate administrative access for "${targetAdmin.fullName}"? They will be locked out of the facility management dashboard until reactivated.`,
        targetName: targetAdmin.fullName,
        targetSub: `${targetAdmin.email} • ${targetAdmin.companyName || 'Unassigned'}`,
        confirmText: 'Suspend Access',
        type: 'danger',
      });
      if (!ok) return;
    }

    const res = await adminApi.toggleAdminStatus(adminId);
    const resolvedStatus = res.success && res.data?.status ? res.data.status : (targetAdmin.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');

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

    await refreshAllTabsData();
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
          onTabChange={handleTabChange}
          companiesCount={totalCompaniesCount > 0 ? totalCompaniesCount : companies.length}
          adminsCount={totalAdminsCount > 0 ? totalAdminsCount : admins.length}
          auditLogsCount={totalAuditLogsCount > 0 ? totalAuditLogsCount : auditLogs.length}
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
            selectedIds={selectedAdminIds}
            onToggleSelect={handleToggleSelectAdmin}
            onSelectAllPage={handleSelectAllAdminsOnPage}
            isAllPageSelected={isAllAdminsPageSelected}
            onEdit={handleOpenEditAdmin}
            onToggleStatus={handleToggleAdminStatus}
            onBulkActivate={handleBulkActivateAdmins}
            onBulkDeactivate={handleBulkDeactivateAdmins}
            onBulkExport={handleExportAdminsCSV}
            onBulkClear={() => setSelectedAdminIds([])}
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
        {activeTab === 'audit' && (
          <AuditLogsTab
            auditLogs={auditLogs}
            totalAuditLogsCount={totalAuditLogsCount}
            search={auditSearch}
            onSearchSubmit={(val) => {
              setAuditSearch(val);
              setAuditPage(1);
            }}
            actionFilter={auditActionFilter}
            onActionFilterChange={(val) => {
              setAuditActionFilter(val);
              setAuditPage(1);
            }}
            entityTypeFilter={auditEntityTypeFilter}
            onEntityTypeFilterChange={(val) => {
              setAuditEntityTypeFilter(val);
              setAuditPage(1);
            }}
            availableActions={availableAuditActions}
            sort={auditSort}
            onSort={handleSortAuditLogs}
            onExportCSV={handleExportAuditLogsCSV}
            currentPage={auditPage}
            pageSize={auditPageSize}
            onPageChange={setAuditPage}
            onPageSizeChange={(newSize) => {
              setAuditPageSize(newSize);
              setAuditPage(1);
            }}
          />
        )}
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
