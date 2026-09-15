import React, { useState, useMemo } from 'react';
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
  Clock,
  MapPin,
  Mail,
  Check,
  X,
  AlertCircle,
  Activity,
  FileText,
  Lock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  ExternalLink,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  Phone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './SuperAdminPortal.css';

// High-Volume Realistic Enterprise Seed Data (Flyway V1 Compatible)
const INITIAL_COMPANIES = [
  {
    id: 1,
    name: 'Acme Corporation',
    companyCode: 'ACME',
    contactInformation: 'admin@acme.com',
    phone: '+1 (800) 555-0101',
    address: '100 Tech Park, Suite 400, Silicon Corridor, CA',
    status: 'ACTIVE',
    createdAt: '2026-08-15',
    departmentsCount: 4,
    roomsCount: 8,
  },
  {
    id: 2,
    name: 'Initech Global Systems',
    companyCode: 'INITECH',
    contactInformation: 'facility@initech.io',
    phone: '+1 (800) 555-0102',
    address: '4120 Freemont Blvd, Building B, Austin, TX',
    status: 'ACTIVE',
    createdAt: '2026-08-18',
    departmentsCount: 3,
    roomsCount: 6,
  },
  {
    id: 3,
    name: 'Cyberdyne Systems Corp',
    companyCode: 'CYBER',
    contactInformation: 'ops@cyberdyne.ai',
    phone: '+1 (800) 555-0103',
    address: '18111 Nordhoff St, Los Angeles, CA',
    status: 'ACTIVE',
    createdAt: '2026-08-20',
    departmentsCount: 5,
    roomsCount: 12,
  },
  {
    id: 4,
    name: 'Wayne Enterprises HQ',
    companyCode: 'WAYNE',
    contactInformation: 'facilities@wayne-enterprises.com',
    phone: '+1 (800) 555-0104',
    address: '1007 Mountain Drive, Gotham Financial District, NY',
    status: 'ACTIVE',
    createdAt: '2026-08-22',
    departmentsCount: 8,
    roomsCount: 24,
  },
  {
    id: 5,
    name: 'Stark Industries R&D',
    companyCode: 'STARK',
    contactInformation: 'campus@starkindustries.com',
    phone: '+1 (800) 555-0105',
    address: '10880 Wilshire Blvd, Suite 1200, Malibu, CA',
    status: 'ACTIVE',
    createdAt: '2026-08-25',
    departmentsCount: 6,
    roomsCount: 16,
  },
  {
    id: 6,
    name: 'Globex Corporation',
    companyCode: 'GLOBEX',
    contactInformation: 'hscorpio@globexcorp.com',
    phone: '+1 (800) 555-0106',
    address: 'Cypress Creek Business Park, Suite 900, OR',
    status: 'ACTIVE',
    createdAt: '2026-08-28',
    departmentsCount: 2,
    roomsCount: 5,
  },
  {
    id: 7,
    name: 'Hooli Technology Labs',
    companyCode: 'HOOLI',
    contactInformation: 'campus-ops@hooli.xyz',
    phone: '+1 (800) 555-0107',
    address: '500 Tech Campus Way, Mountain View, CA',
    status: 'ACTIVE',
    createdAt: '2026-09-01',
    departmentsCount: 7,
    roomsCount: 18,
  },
  {
    id: 8,
    name: 'Pied Piper Cloud Ops',
    companyCode: 'PIED',
    contactInformation: 'richard@piedpiper.com',
    phone: '+1 (800) 555-0108',
    address: '5230 Newell Rd, Palo Alto, CA',
    status: 'ACTIVE',
    createdAt: '2026-09-02',
    departmentsCount: 2,
    roomsCount: 4,
  },
  {
    id: 9,
    name: 'Massive Dynamic Corp',
    companyCode: 'MASSIVE',
    contactInformation: 'contact@massivedynamic.org',
    phone: '+1 (800) 555-0109',
    address: '650 5th Avenue, 32nd Floor, New York, NY',
    status: 'ACTIVE',
    createdAt: '2026-09-03',
    departmentsCount: 4,
    roomsCount: 10,
  },
  {
    id: 10,
    name: 'Umbrella Life Sciences',
    companyCode: 'UMB',
    contactInformation: 'security@umbrellacorp.lab',
    phone: '+1 (800) 555-0110',
    address: 'Arklay R&D Facility, Sector 4, CO',
    status: 'INACTIVE',
    createdAt: '2026-09-05',
    departmentsCount: 1,
    roomsCount: 2,
  },
  {
    id: 11,
    name: 'Aperture Science Innovation',
    companyCode: 'APERTURE',
    contactInformation: 'glados@aperturelabs.com',
    phone: '+1 (800) 555-0111',
    address: 'Enrichment Center, Shaft 9, Upper Peninsula, MI',
    status: 'ACTIVE',
    createdAt: '2026-09-06',
    departmentsCount: 3,
    roomsCount: 8,
  },
  {
    id: 12,
    name: 'Tyrell Corporation Genetics',
    companyCode: 'TYRELL',
    contactInformation: 'admin@tyrellcorp.nexus',
    phone: '+1 (800) 555-0112',
    address: 'Tyrell Pyramid 1, Sector 8, Los Angeles, CA',
    status: 'INACTIVE',
    createdAt: '2026-09-07',
    departmentsCount: 2,
    roomsCount: 4,
  },
  {
    id: 13,
    name: 'Weyland-Yutani Operations',
    companyCode: 'WY',
    contactInformation: 'facility@weyland-yutani.space',
    phone: '+1 (800) 555-0113',
    address: 'Off-World Logistics Hub, Houston, TX',
    status: 'ACTIVE',
    createdAt: '2026-09-08',
    departmentsCount: 5,
    roomsCount: 14,
  },
  {
    id: 14,
    name: 'Dunder Mifflin Paper Co',
    companyCode: 'DMPC',
    contactInformation: 'mscott@dundermifflin.com',
    phone: '+1 (800) 555-0114',
    address: '1725 Slough Avenue, Suite 200, Scranton, PA',
    status: 'ACTIVE',
    createdAt: '2026-09-09',
    departmentsCount: 3,
    roomsCount: 3,
  },
  {
    id: 15,
    name: 'Wonka Confectionery Labs',
    companyCode: 'WONKA',
    contactInformation: 'willy@wonkafactory.co.uk',
    phone: '+1 (800) 555-0115',
    address: '1 Industrial Park Lane, London, UK',
    status: 'ACTIVE',
    createdAt: '2026-09-10',
    departmentsCount: 4,
    roomsCount: 7,
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
    createdAt: '2026-08-15',
    lastLogin: 'Today, 10:45 AM',
  },
  {
    id: 3,
    fullName: 'Bill Lumbergh',
    email: 'blumbergh@initech.io',
    companyId: 2,
    companyName: 'Initech Global Systems',
    role: 'COMPANY_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-08-18',
    lastLogin: 'Yesterday, 04:20 PM',
  },
  {
    id: 4,
    fullName: 'Miles Dyson',
    email: 'mdyson@cyberdyne.ai',
    companyId: 3,
    companyName: 'Cyberdyne Systems Corp',
    role: 'COMPANY_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-08-20',
    lastLogin: 'Sep 12, 11:30 AM',
  },
  {
    id: 5,
    fullName: 'Lucius Fox',
    email: 'lfox@wayne-enterprises.com',
    companyId: 4,
    companyName: 'Wayne Enterprises HQ',
    role: 'COMPANY_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-08-22',
    lastLogin: 'Today, 08:15 AM',
  },
  {
    id: 6,
    fullName: 'Pepper Potts',
    email: 'ppotts@starkindustries.com',
    companyId: 5,
    companyName: 'Stark Industries R&D',
    role: 'COMPANY_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-08-25',
    lastLogin: 'Sep 14, 02:00 PM',
  },
  {
    id: 7,
    fullName: 'Hank Scorpio',
    email: 'hscorpio@globexcorp.com',
    companyId: 6,
    companyName: 'Globex Corporation',
    role: 'COMPANY_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-08-28',
    lastLogin: 'Sep 10, 09:00 AM',
  },
  {
    id: 8,
    fullName: 'Gavin Belson',
    email: 'gbelson@hooli.xyz',
    companyId: 7,
    companyName: 'Hooli Technology Labs',
    role: 'COMPANY_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-09-01',
    lastLogin: 'Today, 01:10 PM',
  },
  {
    id: 9,
    fullName: 'Jared Dunn',
    email: 'jared@piedpiper.com',
    companyId: 8,
    companyName: 'Pied Piper Cloud Ops',
    role: 'COMPANY_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-09-02',
    lastLogin: 'Today, 09:30 AM',
  },
  {
    id: 10,
    fullName: 'Nina Sharp',
    email: 'nsharp@massivedynamic.org',
    companyId: 9,
    companyName: 'Massive Dynamic Corp',
    role: 'COMPANY_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-09-03',
    lastLogin: 'Sep 11, 05:40 PM',
  },
  {
    id: 11,
    fullName: 'Albert Wesker',
    email: 'awesker@umbrellacorp.lab',
    companyId: 10,
    companyName: 'Umbrella Life Sciences',
    role: 'COMPANY_ADMIN',
    status: 'INACTIVE',
    createdAt: '2026-09-05',
    lastLogin: 'Sep 05, 12:00 PM',
  },
  {
    id: 12,
    fullName: 'Cave Johnson',
    email: 'cjohnson@aperturelabs.com',
    companyId: 11,
    companyName: 'Aperture Science Innovation',
    role: 'COMPANY_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-09-06',
    lastLogin: 'Sep 13, 03:22 PM',
  },
  {
    id: 13,
    fullName: 'Eldon Tyrell',
    email: 'etyrell@tyrellcorp.nexus',
    companyId: 12,
    companyName: 'Tyrell Corporation Genetics',
    role: 'COMPANY_ADMIN',
    status: 'INACTIVE',
    createdAt: '2026-09-07',
    lastLogin: 'Sep 07, 08:30 AM',
  },
  {
    id: 14,
    fullName: 'Carter Burke',
    email: 'cburke@weyland-yutani.space',
    companyId: 13,
    companyName: 'Weyland-Yutani Operations',
    role: 'COMPANY_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-09-08',
    lastLogin: 'Today, 11:00 AM',
  },
  {
    id: 15,
    fullName: 'Dwight Schrute',
    email: 'dschrute@dundermifflin.com',
    companyId: 14,
    companyName: 'Dunder Mifflin Paper Co',
    role: 'COMPANY_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-09-09',
    lastLogin: 'Today, 07:45 AM',
  },
  {
    id: 16,
    fullName: 'Charlie Bucket',
    email: 'cbucket@wonkafactory.co.uk',
    companyId: 15,
    companyName: 'Wonka Confectionery Labs',
    role: 'COMPANY_ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-09-10',
    lastLogin: 'Sep 14, 04:15 PM',
  },
];

const INITIAL_AUDIT_LOGS = [
  {
    id: 101,
    action: 'REGISTER_TENANT',
    entityType: 'COMPANY',
    entityName: 'Wonka Confectionery Labs',
    performedBy: 'superadmin@system.com',
    timestamp: '2026-09-10 14:30:00',
    details: 'Provisioned new company code WONKA with 7 room licenses',
  },
  {
    id: 102,
    action: 'CREATE_FACILITY_ADMIN',
    entityType: 'USER',
    entityName: 'cbucket@wonkafactory.co.uk',
    performedBy: 'superadmin@system.com',
    timestamp: '2026-09-10 14:35:00',
    details: 'Assigned Charlie Bucket as primary facility administrator for Wonka Labs',
  },
  {
    id: 103,
    action: 'DEACTIVATE_TENANT',
    entityType: 'COMPANY',
    entityName: 'Umbrella Life Sciences',
    performedBy: 'superadmin@system.com',
    timestamp: '2026-09-05 18:00:00',
    details: 'Tenant status changed to INACTIVE due to compliance audit',
  },
  {
    id: 104,
    action: 'REGISTER_TENANT',
    entityType: 'COMPANY',
    entityName: 'Wayne Enterprises HQ',
    performedBy: 'superadmin@system.com',
    timestamp: '2026-08-22 09:15:00',
    details: 'Provisioned enterprise tenant WAYNE with multi-building room quota',
  },
];

export default function SuperAdminPortal() {
  const { user } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState('companies'); // 'companies' | 'admins' | 'audit'

  // Data State
  const [companies, setCompanies] = useState(INITIAL_COMPANIES);
  const [admins, setAdmins] = useState(INITIAL_ADMINS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  // Search & Status Filters
  const [companySearch, setCompanySearch] = useState('');
  const [companyStatusFilter, setCompanyStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCompanyFilter, setAdminCompanyFilter] = useState('ALL');
  const [adminStatusFilter, setAdminStatusFilter] = useState('ALL');

  // Sorting State
  const [companySort, setCompanySort] = useState({ field: 'name', direction: 'asc' });
  const [adminSort, setAdminSort] = useState({ field: 'fullName', direction: 'asc' });

  // Pagination State
  const [companyPage, setCompanyPage] = useState(1);
  const [companyPageSize, setCompanyPageSize] = useState(10);
  const [adminPage, setAdminPage] = useState(1);
  const [adminPageSize, setAdminPageSize] = useState(10);

  // Multi-Selection State for Bulk Operations
  const [selectedCompanyIds, setSelectedCompanyIds] = useState([]);
  const [selectedAdminIds, setSelectedAdminIds] = useState([]);

  // Slide-Over Detail Drawer State
  const [drawerCompany, setDrawerCompany] = useState(null);

  // Modals State
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    companyCode: '',
    contactInformation: '',
    phone: '',
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

  // Toast feedback
  const [toast, setToast] = useState(null);
  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- Sorting Helpers ---
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

  // --- Filtered & Sorted Companies ---
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

  // Paginated slice for companies
  const totalCompanyPages = Math.ceil(filteredAndSortedCompanies.length / companyPageSize) || 1;
  const paginatedCompanies = useMemo(() => {
    const start = (companyPage - 1) * companyPageSize;
    return filteredAndSortedCompanies.slice(start, start + companyPageSize);
  }, [filteredAndSortedCompanies, companyPage, companyPageSize]);

  // --- Filtered & Sorted Admins ---
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

  const totalAdminPages = Math.ceil(filteredAndSortedAdmins.length / adminPageSize) || 1;
  const paginatedAdmins = useMemo(() => {
    const start = (adminPage - 1) * adminPageSize;
    return filteredAndSortedAdmins.slice(start, start + adminPageSize);
  }, [filteredAndSortedAdmins, adminPage, adminPageSize]);

  // --- Multi-Select Handlers ---
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

  // --- Bulk Operations ---
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

  // --- Drawer Deep Link ---
  const handleViewCompanyAdmins = (companyId) => {
    setDrawerCompany(null);
    setActiveTab('admins');
    setAdminCompanyFilter(String(companyId));
    setAdminSearch('');
    setAdminPage(1);
  };

  // --- Company Modal Handlers ---
  const handleOpenCreateCompany = () => {
    setEditingCompany(null);
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

  const handleOpenEditCompany = (comp) => {
    setEditingCompany(comp);
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

  const handleSaveCompany = (e) => {
    e.preventDefault();
    if (!companyForm.name.trim() || !companyForm.companyCode.trim()) {
      showToast('Validation Error', 'Company Name and Code are required.', 'error');
      return;
    }

    if (editingCompany) {
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
      if (drawerCompany && drawerCompany.id === editingCompany.id) {
        setDrawerCompany((prev) => ({
          ...prev,
          ...companyForm,
          companyCode: companyForm.companyCode.toUpperCase(),
        }));
      }
      showToast('Company Updated', `Saved changes for ${companyForm.name}.`);
    } else {
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
      showToast('Company Created', `Registered new tenant "${newCompany.name}".`);
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
          if (drawerCompany && drawerCompany.id === companyId) {
            setDrawerCompany((prev) => ({ ...prev, status: nextStatus }));
          }
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  // --- Admin Modal Handlers ---
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
      showToast('Admin Updated', `Updated credentials for ${adminForm.fullName}.`);
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
      showToast('Admin Provisioned', `Created facility admin for ${compName}.`);
    }
    setIsAdminModalOpen(false);
  };

  const handleToggleAdminStatus = (adminId) => {
    setAdmins((prev) =>
      prev.map((a) => {
        if (a.id === adminId) {
          const nextStatus = a.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          showToast(
            'Admin Status Changed',
            `${a.fullName} access is now ${nextStatus.toLowerCase()}.`,
            nextStatus === 'ACTIVE' ? 'success' : 'warning'
          );
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  };

  // Metrics calculations
  const activeCompaniesCount = companies.filter((c) => c.status === 'ACTIVE').length;
  const activeAdminsCount = admins.filter((a) => a.status === 'ACTIVE').length;

  return (
    <div className="superadmin-portal" id="superadmin-console">
      <div className="container">
        {/* Top Focused Metrics Bar */}
        <div className="superadmin-metrics-grid">
          <div className="metric-card">
            <div className="metric-card__icon metric-card__icon--blue">
              <Building2 size={26} />
            </div>
            <div className="metric-card__info">
              <span className="metric-card__label">Tenant Companies</span>
              <div className="metric-card__row">
                <span className="metric-card__value">{companies.length}</span>
                <span className="metric-card__badge-pill">
                  {Math.round((activeCompaniesCount / (companies.length || 1)) * 100)}% Active
                </span>
              </div>
              <span className="metric-card__sub">
                <strong>{activeCompaniesCount}</strong> active • {companies.length - activeCompaniesCount} suspended
              </span>
            </div>
          </div>

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
                Assigned across {new Set(admins.map((a) => a.companyId)).size} tenant companies
              </span>
            </div>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="superadmin-tabs-bar">
          <div className="superadmin-tabs">
            <button
              type="button"
              className={`superadmin-tab ${activeTab === 'companies' ? 'superadmin-tab--active' : ''}`}
              onClick={() => {
                setActiveTab('companies');
                setSelectedCompanyIds([]);
              }}
            >
              <Building2 size={16} />
              <span>Tenant Companies</span>
              <span className="tab-count-badge">{companies.length}</span>
            </button>
            <button
              type="button"
              className={`superadmin-tab ${activeTab === 'admins' ? 'superadmin-tab--active' : ''}`}
              onClick={() => {
                setActiveTab('admins');
                setSelectedAdminIds([]);
              }}
            >
              <Users size={16} />
              <span>Facility Administrators</span>
              <span className="tab-count-badge">{admins.length}</span>
            </button>
            <button
              type="button"
              className={`superadmin-tab ${activeTab === 'audit' ? 'superadmin-tab--active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <FileText size={16} />
              <span>System Audit Logs</span>
              <span className="tab-count-badge">{auditLogs.length}</span>
            </button>
          </div>

          <div className="superadmin-quick-actions">
            {activeTab === 'companies' && (
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={handleOpenCreateCompany}
              >
                <Plus size={15} />
                <span>Register Company</span>
              </button>
            )}
            {activeTab === 'admins' && (
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={handleOpenCreateAdmin}
              >
                <Plus size={15} />
                <span>Create Facility Admin</span>
              </button>
            )}
          </div>
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
            {/* Toolbar: Search, Status Segments, and CSV Export */}
            <div className="superadmin-toolbar">
              <div className="superadmin-search-box">
                <Search size={16} className="search-box-icon" />
                <input
                  type="text"
                  placeholder="Search by company name, code, contact or city..."
                  value={companySearch}
                  onChange={(e) => {
                    setCompanySearch(e.target.value);
                    setCompanyPage(1);
                  }}
                  className="superadmin-search-input"
                />
                {companySearch && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => {
                      setCompanySearch('');
                      setCompanyPage(1);
                    }}
                  >
                    &times;
                  </button>
                )}
              </div>

              {/* Status Segment Pills with Live Counts */}
              <div className="status-segment-group">
                <button
                  type="button"
                  className={`status-segment-btn ${companyStatusFilter === 'ALL' ? 'status-segment-btn--active' : ''}`}
                  onClick={() => {
                    setCompanyStatusFilter('ALL');
                    setCompanyPage(1);
                  }}
                >
                  All <span>{companies.length}</span>
                </button>
                <button
                  type="button"
                  className={`status-segment-btn ${companyStatusFilter === 'ACTIVE' ? 'status-segment-btn--active' : ''}`}
                  onClick={() => {
                    setCompanyStatusFilter('ACTIVE');
                    setCompanyPage(1);
                  }}
                >
                  Active <span>{activeCompaniesCount}</span>
                </button>
                <button
                  type="button"
                  className={`status-segment-btn ${companyStatusFilter === 'INACTIVE' ? 'status-segment-btn--active' : ''}`}
                  onClick={() => {
                    setCompanyStatusFilter('INACTIVE');
                    setCompanyPage(1);
                  }}
                >
                  Suspended <span>{companies.length - activeCompaniesCount}</span>
                </button>
              </div>

              <button
                type="button"
                className="btn btn--outline btn--sm export-btn"
                onClick={handleExportCompaniesCSV}
                title="Export company list to CSV spreadsheet"
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Floating Bulk Operations Toolbar */}
            {selectedCompanyIds.length > 0 && (
              <div className="bulk-toolbar">
                <div className="bulk-toolbar__info">
                  <span className="bulk-badge">{selectedCompanyIds.length}</span>
                  <span>companies selected</span>
                </div>
                <div className="bulk-toolbar__actions">
                  <button
                    type="button"
                    className="bulk-btn bulk-btn--activate"
                    onClick={handleBulkActivateCompanies}
                  >
                    <CheckCircle2 size={14} />
                    Activate Selected
                  </button>
                  <button
                    type="button"
                    className="bulk-btn bulk-btn--deactivate"
                    onClick={handleBulkDeactivateCompanies}
                  >
                    <XCircle size={14} />
                    Suspend Selected
                  </button>
                  <button
                    type="button"
                    className="bulk-btn bulk-btn--export"
                    onClick={handleExportCompaniesCSV}
                  >
                    <Download size={14} />
                    Export Selected
                  </button>
                  <button
                    type="button"
                    className="bulk-btn bulk-btn--clear"
                    onClick={() => setSelectedCompanyIds([])}
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            )}

            {/* High-Volume Scalable Data Table */}
            <div className="table-responsive">
              <table className="superadmin-table">
                <thead>
                  <tr>
                    <th className="th-checkbox">
                      <input
                        type="checkbox"
                        checked={isAllCompaniesPageSelected}
                        onChange={handleSelectAllCompaniesOnPage}
                        aria-label="Select all on this page"
                      />
                    </th>
                    <th className="th-sortable" onClick={() => handleSortCompanies('companyCode')}>
                      <div className="th-content">
                        <span>Code</span>
                        {companySort.field === 'companyCode' ? (
                          companySort.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                        ) : (
                          <ArrowUpDown size={13} className="sort-idle" />
                        )}
                      </div>
                    </th>
                    <th className="th-sortable" onClick={() => handleSortCompanies('name')}>
                      <div className="th-content">
                        <span>Tenant Company</span>
                        {companySort.field === 'name' ? (
                          companySort.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                        ) : (
                          <ArrowUpDown size={13} className="sort-idle" />
                        )}
                      </div>
                    </th>
                    <th>Contact Info</th>
                    <th>Location / Campus</th>
                    <th>Facility Admins</th>
                    <th className="th-sortable" onClick={() => handleSortCompanies('status')}>
                      <div className="th-content">
                        <span>Status</span>
                        {companySort.field === 'status' ? (
                          companySort.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                        ) : (
                          <ArrowUpDown size={13} className="sort-idle" />
                        )}
                      </div>
                    </th>
                    <th className="th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCompanies.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="td-empty">
                        <Building2 size={32} className="empty-icon" />
                        <p>No companies match your current search or filter.</p>
                        <button
                          type="button"
                          className="btn btn--outline btn--sm"
                          onClick={() => {
                            setCompanySearch('');
                            setCompanyStatusFilter('ALL');
                          }}
                        >
                          Reset Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    paginatedCompanies.map((c) => {
                      const compAdmins = admins.filter((a) => a.companyId === c.id);
                      const isSelected = selectedCompanyIds.includes(c.id);
                      return (
                        <tr
                          key={c.id}
                          className={`${isSelected ? 'tr--selected' : ''}`}
                          onClick={() => setDrawerCompany(c)}
                        >
                          <td className="td-checkbox" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectCompany(c.id)}
                            />
                          </td>
                          <td>
                            <span className="code-pill">{c.companyCode}</span>
                          </td>
                          <td className="td-strong">
                            <div className="company-title-cell">
                              <span className="company-name">{c.name}</span>
                              <span className="company-created">Est. {c.createdAt}</span>
                            </div>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="contact-cell">
                              <span className="contact-item">
                                <Mail size={12} />
                                <a href={`mailto:${c.contactInformation}`}>{c.contactInformation || 'N/A'}</a>
                              </span>
                              {c.phone && (
                                <span className="contact-item text-muted">
                                  <Phone size={12} />
                                  {c.phone}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="address-snippet" title={c.address}>
                              <MapPin size={12} />
                              {c.address || 'Not specified'}
                            </span>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="admin-count-pill"
                              onClick={() => handleViewCompanyAdmins(c.id)}
                              title={`View ${compAdmins.length} admins assigned to ${c.name}`}
                            >
                              <Users size={12} />
                              <span>{compAdmins.length} Admin{compAdmins.length === 1 ? '' : 's'}</span>
                              <ChevronRight size={12} />
                            </button>
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
                          <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="action-btn action-btn--inspect"
                              onClick={() => setDrawerCompany(c)}
                              title="Inspect Details"
                            >
                              <Eye size={14} />
                            </button>
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
                              title={c.status === 'ACTIVE' ? 'Suspend Company' : 'Activate Company'}
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

            {/* Pagination Footer */}
            <div className="superadmin-pagination">
              <div className="pagination-info">
                Showing{' '}
                <strong>
                  {filteredAndSortedCompanies.length === 0
                    ? 0
                    : (companyPage - 1) * companyPageSize + 1}
                </strong>{' '}
                to{' '}
                <strong>
                  {Math.min(companyPage * companyPageSize, filteredAndSortedCompanies.length)}
                </strong>{' '}
                of <strong>{filteredAndSortedCompanies.length}</strong> companies
              </div>

              <div className="pagination-controls">
                <div className="page-size-selector">
                  <span>Rows:</span>
                  <select
                    value={companyPageSize}
                    onChange={(e) => {
                      setCompanyPageSize(Number(e.target.value));
                      setCompanyPage(1);
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="page-buttons">
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={companyPage <= 1}
                    onClick={() => setCompanyPage(1)}
                    title="First Page"
                  >
                    <ChevronsLeft size={16} />
                  </button>
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={companyPage <= 1}
                    onClick={() => setCompanyPage((p) => p - 1)}
                    title="Previous Page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="current-page-badge">
                    Page {companyPage} of {totalCompanyPages}
                  </span>

                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={companyPage >= totalCompanyPages}
                    onClick={() => setCompanyPage((p) => p + 1)}
                    title="Next Page"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={companyPage >= totalCompanyPages}
                    onClick={() => setCompanyPage(totalCompanyPages)}
                    title="Last Page"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ TAB 2: FACILITY ADMINS MANAGEMENT ═══════════════ */}
        {activeTab === 'admins' && (
          <div className="superadmin-panel">
            <div className="superadmin-toolbar">
              <div className="superadmin-search-box">
                <Search size={16} className="search-box-icon" />
                <input
                  type="text"
                  placeholder="Search by administrator name, email, or company..."
                  value={adminSearch}
                  onChange={(e) => {
                    setAdminSearch(e.target.value);
                    setAdminPage(1);
                  }}
                  className="superadmin-search-input"
                />
                {adminSearch && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => {
                      setAdminSearch('');
                      setAdminPage(1);
                    }}
                  >
                    &times;
                  </button>
                )}
              </div>

              {/* Company Filter Dropdown */}
              <div className={`superadmin-dropdown-wrap ${adminCompanyFilter !== 'ALL' ? 'superadmin-dropdown-wrap--active' : ''}`}>
                <Building2 size={15} className="filter-select-icon" />
                <select
                  value={adminCompanyFilter}
                  onChange={(e) => {
                    setAdminCompanyFilter(e.target.value);
                    setAdminPage(1);
                  }}
                  className="superadmin-filter-select"
                  aria-label="Filter administrators by tenant company"
                >
                  <option value="ALL">All Tenant Companies ({companies.length})</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.companyCode})
                    </option>
                  ))}
                </select>
                {adminCompanyFilter !== 'ALL' ? (
                  <button
                    type="button"
                    className="filter-select-clear"
                    onClick={() => {
                      setAdminCompanyFilter('ALL');
                      setAdminPage(1);
                    }}
                    title="Reset to All Tenant Companies"
                  >
                    &times;
                  </button>
                ) : (
                  <ChevronDown size={15} className="filter-select-arrow" />
                )}
              </div>

              {/* Status Segment Pills */}
              <div className="status-segment-group">
                <button
                  type="button"
                  className={`status-segment-btn ${adminStatusFilter === 'ALL' ? 'status-segment-btn--active' : ''}`}
                  onClick={() => {
                    setAdminStatusFilter('ALL');
                    setAdminPage(1);
                  }}
                >
                  All <span>{admins.length}</span>
                </button>
                <button
                  type="button"
                  className={`status-segment-btn ${adminStatusFilter === 'ACTIVE' ? 'status-segment-btn--active' : ''}`}
                  onClick={() => {
                    setAdminStatusFilter('ACTIVE');
                    setAdminPage(1);
                  }}
                >
                  Active <span>{activeAdminsCount}</span>
                </button>
                <button
                  type="button"
                  className={`status-segment-btn ${adminStatusFilter === 'INACTIVE' ? 'status-segment-btn--active' : ''}`}
                  onClick={() => {
                    setAdminStatusFilter('INACTIVE');
                    setAdminPage(1);
                  }}
                >
                  Suspended <span>{admins.length - activeAdminsCount}</span>
                </button>
              </div>
            </div>

            {/* Admins Table */}
            <div className="table-responsive">
              <table className="superadmin-table">
                <thead>
                  <tr>
                    <th className="th-sortable" onClick={() => handleSortAdmins('fullName')}>
                      <div className="th-content">
                        <span>Administrator Name</span>
                        {adminSort.field === 'fullName' ? (
                          adminSort.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                        ) : (
                          <ArrowUpDown size={13} className="sort-idle" />
                        )}
                      </div>
                    </th>
                    <th>Corporate Email</th>
                    <th className="th-sortable" onClick={() => handleSortAdmins('companyName')}>
                      <div className="th-content">
                        <span>Assigned Company</span>
                        {adminSort.field === 'companyName' ? (
                          adminSort.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                        ) : (
                          <ArrowUpDown size={13} className="sort-idle" />
                        )}
                      </div>
                    </th>
                    <th>Role Scope</th>
                    <th>Last Active</th>
                    <th className="th-sortable" onClick={() => handleSortAdmins('status')}>
                      <div className="th-content">
                        <span>Status</span>
                        {adminSort.field === 'status' ? (
                          adminSort.direction === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                        ) : (
                          <ArrowUpDown size={13} className="sort-idle" />
                        )}
                      </div>
                    </th>
                    <th className="th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAdmins.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="td-empty">
                        <Users size={32} className="empty-icon" />
                        <p>No Facility Administrators match your search criteria.</p>
                        <button
                          type="button"
                          className="btn btn--outline btn--sm"
                          onClick={() => {
                            setAdminSearch('');
                            setAdminCompanyFilter('ALL');
                            setAdminStatusFilter('ALL');
                          }}
                        >
                          Reset Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    paginatedAdmins.map((a) => (
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
                            <a href={`mailto:${a.email}`}>{a.email}</a>
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
                            title={a.status === 'ACTIVE' ? 'Suspend Admin' : 'Activate Admin'}
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

            {/* Pagination Footer */}
            <div className="superadmin-pagination">
              <div className="pagination-info">
                Showing{' '}
                <strong>
                  {filteredAndSortedAdmins.length === 0
                    ? 0
                    : (adminPage - 1) * adminPageSize + 1}
                </strong>{' '}
                to{' '}
                <strong>
                  {Math.min(adminPage * adminPageSize, filteredAndSortedAdmins.length)}
                </strong>{' '}
                of <strong>{filteredAndSortedAdmins.length}</strong> administrators
              </div>

              <div className="pagination-controls">
                <div className="page-size-selector">
                  <span>Rows:</span>
                  <select
                    value={adminPageSize}
                    onChange={(e) => {
                      setAdminPageSize(Number(e.target.value));
                      setAdminPage(1);
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                  </select>
                </div>

                <div className="page-buttons">
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={adminPage <= 1}
                    onClick={() => setAdminPage(1)}
                    title="First Page"
                  >
                    <ChevronsLeft size={16} />
                  </button>
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={adminPage <= 1}
                    onClick={() => setAdminPage((p) => p - 1)}
                    title="Previous Page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="current-page-badge">
                    Page {adminPage} of {totalAdminPages}
                  </span>

                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={adminPage >= totalAdminPages}
                    onClick={() => setAdminPage((p) => p + 1)}
                    title="Next Page"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={adminPage >= totalAdminPages}
                    onClick={() => setAdminPage(totalAdminPages)}
                    title="Last Page"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ TAB 3: AUDIT LOGS ═══════════════ */}
        {activeTab === 'audit' && (
          <div className="superadmin-panel">
            <div className="superadmin-toolbar">
              <h3 className="panel-subheading">System Configuration & Multi-Tenant Audit Trail</h3>
              <span className="audit-note">Immutable record of tenant provisioning and credential assignments</span>
            </div>

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
        )}
      </div>

      {/* ═══════════════ SLIDE-OVER DRAWER: COMPANY INSPECTOR ═══════════════ */}
      {drawerCompany && (
        <div className="sa-drawer-backdrop" onClick={() => setDrawerCompany(null)}>
          <div className="sa-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="sa-drawer__header">
              <div className="sa-drawer__title-group">
                <span className="code-pill">{drawerCompany.companyCode}</span>
                <h2>{drawerCompany.name}</h2>
              </div>
              <button
                type="button"
                className="sa-drawer__close"
                onClick={() => setDrawerCompany(null)}
                aria-label="Close drawer"
              >
                &times;
              </button>
            </div>

            <div className="sa-drawer__body">
              {/* Status Banner */}
              <div className="drawer-status-banner">
                <span
                  className={`status-pill ${
                    drawerCompany.status === 'ACTIVE'
                      ? 'status-pill--active'
                      : 'status-pill--inactive'
                  }`}
                >
                  {drawerCompany.status}
                </span>
                <span className="drawer-date">Registered on {drawerCompany.createdAt}</span>
              </div>

              {/* Quick Summary Cards */}
              <div className="drawer-stats-grid">
                <div className="drawer-stat-card">
                  <span className="drawer-stat-label">Facility Admins</span>
                  <span className="drawer-stat-value">
                    {admins.filter((a) => a.companyId === drawerCompany.id).length}
                  </span>
                </div>
                <div className="drawer-stat-card">
                  <span className="drawer-stat-label">Departments</span>
                  <span className="drawer-stat-value">{drawerCompany.departmentsCount || 1}</span>
                </div>
                <div className="drawer-stat-card">
                  <span className="drawer-stat-label">Rooms Monitored</span>
                  <span className="drawer-stat-value">{drawerCompany.roomsCount || 2}</span>
                </div>
              </div>

              {/* Company Info */}
              <div className="drawer-section">
                <h4 className="drawer-section-title">Tenant Metadata</h4>
                <div className="drawer-info-list">
                  <div className="drawer-info-item">
                    <span className="drawer-info-label">Corporate Email</span>
                    <span className="drawer-info-val">
                      <Mail size={13} />
                      <a href={`mailto:${drawerCompany.contactInformation}`}>
                        {drawerCompany.contactInformation || 'Not configured'}
                      </a>
                    </span>
                  </div>
                  {drawerCompany.phone && (
                    <div className="drawer-info-item">
                      <span className="drawer-info-label">Direct Phone</span>
                      <span className="drawer-info-val">
                        <Phone size={13} />
                        {drawerCompany.phone}
                      </span>
                    </div>
                  )}
                  <div className="drawer-info-item">
                    <span className="drawer-info-label">Campus Address</span>
                    <span className="drawer-info-val">
                      <MapPin size={13} />
                      {drawerCompany.address || 'Address not registered'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assigned Facility Admins List */}
              <div className="drawer-section">
                <div className="drawer-section-header">
                  <h4 className="drawer-section-title">Assigned Facility Administrators</h4>
                  <button
                    type="button"
                    className="drawer-link-btn"
                    onClick={() => handleViewCompanyAdmins(drawerCompany.id)}
                  >
                    Manage Admins <ArrowRight size={13} />
                  </button>
                </div>

                <div className="drawer-admin-list">
                  {admins.filter((a) => a.companyId === drawerCompany.id).length === 0 ? (
                    <div className="drawer-empty-notice">
                      <AlertCircle size={15} />
                      <span>No administrator assigned to this tenant yet.</span>
                    </div>
                  ) : (
                    admins
                      .filter((a) => a.companyId === drawerCompany.id)
                      .map((adm) => (
                        <div key={adm.id} className="drawer-admin-card">
                          <div className="admin-avatar">
                            {adm.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="drawer-admin-details">
                            <span className="drawer-admin-name">{adm.fullName}</span>
                            <span className="drawer-admin-email">{adm.email}</span>
                          </div>
                          <span
                            className={`status-pill ${
                              adm.status === 'ACTIVE'
                                ? 'status-pill--active'
                                : 'status-pill--inactive'
                            }`}
                          >
                            {adm.status}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Actions Footer */}
            <div className="sa-drawer__footer">
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => handleOpenEditCompany(drawerCompany)}
              >
                <Edit2 size={14} />
                Edit Company
              </button>
              <button
                type="button"
                className={`btn btn--sm ${
                  drawerCompany.status === 'ACTIVE' ? 'btn--deactivate' : 'btn--primary'
                }`}
                onClick={() => handleToggleCompanyStatus(drawerCompany.id)}
              >
                {drawerCompany.status === 'ACTIVE' ? 'Suspend Tenant' : 'Activate Tenant'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                    placeholder="e.g. Initech Global"
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
                    placeholder="e.g. INITECH"
                    maxLength={10}
                    value={companyForm.companyCode}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, companyCode: e.target.value.toUpperCase() })
                    }
                    required
                  />
                </div>
              </div>

              <div className="sa-form-grid">
                <div className="sa-form-group">
                  <label htmlFor="sa-comp-contact">Contact Email *</label>
                  <input
                    id="sa-comp-contact"
                    type="email"
                    placeholder="e.g. admin@initech.io"
                    value={companyForm.contactInformation}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, contactInformation: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="sa-form-group">
                  <label htmlFor="sa-comp-phone">Direct Phone</label>
                  <input
                    id="sa-comp-phone"
                    type="text"
                    placeholder="e.g. +1 (800) 555-0100"
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="sa-form-group">
                <label htmlFor="sa-comp-addr">Registered Campus Address</label>
                <textarea
                  id="sa-comp-addr"
                  rows={2}
                  placeholder="e.g. 4120 Freemont Blvd, Building B, Austin, TX"
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
                  <option value="ACTIVE">ACTIVE (Authorized for physical room scheduling)</option>
                  <option value="INACTIVE">INACTIVE (Temporarily suspended)</option>
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
                  placeholder="e.g. Bill Lumbergh"
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
                  placeholder="e.g. blumbergh@initech.io"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  required
                />
              </div>

              {!editingAdmin && (
                <div className="sa-form-group">
                  <label htmlFor="sa-adm-pwd">Initial Password *</label>
                  <input
                    id="sa-adm-pwd"
                    type="password"
                    placeholder="e.g. password123"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    required
                  />
                  <span className="sa-form-hint">
                    Hashed with BCrypt upon storage. Can be updated after initial login.
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
                  <option value="ACTIVE">ACTIVE (Authorized to manage company spaces)</option>
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
