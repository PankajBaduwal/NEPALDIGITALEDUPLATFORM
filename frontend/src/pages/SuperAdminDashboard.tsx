import React, { useState, useEffect } from 'react';
import { UserManagementPanel } from '@/components/admin/UserManagementPanel';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Building2,
  Users,
  BookOpen,
  Atom,
  UploadCloud,
  LogOut,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Download,
  AlertCircle,
  BookCheck,
  Layers,
  Sparkles,
  FileText,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  CreditCard,
  Clock,
  CheckCircle,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  MapPin,
  ChevronRight,
  Menu,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { PdfReaderModal, TextbookData } from '../components/PdfReaderModal';
import { CurriculumLibraryPanel } from '../components/academic/CurriculumLibraryPanel';
import { SimulationViewerModal } from '../components/SimulationViewerModal';
import { InteractiveActivityPlayer } from '../components/InteractiveActivityPlayer';
import { DemoBanner } from '../components/common/DemoBanner';
import { AIIndexStatusPanel } from '../components/admin/AIIndexStatusPanel';
import { SecurityPanel } from '../components/admin/SecurityPanel';
import { PlatformOpsPanel } from '../components/admin/PlatformOpsPanel';
import { BulkSubscriptionsPanel } from '../components/admin/BulkSubscriptionsPanel';
import { useDialogs } from '../components/common/Dialogs';
import { BulkInstitutionImport } from '../components/admin/BulkInstitutionImport';
import './superAdminResponsive.css';
import { SuperAdminProvisioningWizardModal } from '../components/admin/SuperAdminProvisioningWizardModal';
import { RegistrationRequestsManager } from '../components/admin/RegistrationRequestsManager';
import { ProvisioningHistoryManager } from '../components/admin/ProvisioningHistoryManager';
import { InstitutionManagementModal } from '../components/admin/InstitutionManagementModal';
import { ClassTextbookBrowser } from '../components/academic/ClassTextbookBrowser';
import { formatTime } from '../utils/dates';

export const SuperAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'INSTITUTIONS' | 'REQUESTS' | 'PROVISIONING_HISTORY' | 'IMPORT' | 'USERS' | 'LIBRARY' | 'CURRICULUM' | 'SIMULATIONS' | 'SUBSCRIPTIONS' | 'AI_INDEX' | 'SECURITY' | 'PLATFORM'>('OVERVIEW');
  const [isProvisioningWizardOpen, setIsProvisioningWizardOpen] = useState(false);
  const [selectedInstForManage, setSelectedInstForManage] = useState<string | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [institutions, setInstitutions] = useState<any[]>([]);
  // Full (capped) list used only by pickers such as the subscription-assignment dropdown
  const [institutionOptions, setInstitutionOptions] = useState<any[]>([]);
  const [instPage, setInstPage] = useState(1);
  const [instTotalPages, setInstTotalPages] = useState(1);
  const [instTotal, setInstTotal] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Phase 12: Subscriptions & Licensing State
  const [plans, setPlans] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [renewalDashboard, setRenewalDashboard] = useState<any>(null);
  const [subHistory, setSubHistory] = useState<any[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    institutionId: '',
    planId: '',
    durationMonths: 12,
    billingCycle: 'ANNUAL' as 'ANNUAL' | 'MONTHLY',
    notes: '',
  });
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProvince, setFilterProvince] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newInst, setNewInst] = useState({
    emisCode: '',
    name: '',
    nameNepali: '',
    type: 'COMMUNITY',
    province: 'Bagmati Province',
    district: 'Kathmandu',
    localLevel: 'Kathmandu Metropolitan City',
    email: '',
    phone: '',
    adminUsername: '',
    adminPassword: '',
  });

  // Bulk import state
  const [importRows, setImportRows] = useState<string>('');
  const [importPreview, setImportPreview] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);

  // ── Curriculum & Textbook State ─────────────────────────────
  const [textbooks, setTextbooks] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [curriculumLoading, setCurriculumLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedMedium, setSelectedMedium] = useState<string>('');
  const [textbookSearch, setTextbookSearch] = useState<string>('');
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestStats, setIngestStats] = useState<any>(null);

  // Reader Modal State
  const [activeReaderTextbook, setActiveReaderTextbook] = useState<TextbookData | null>(null);

  // Upload Textbook Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    titleNepali: '',
    gradeNumber: '10',
    medium: 'NEPALI',
    subjectId: '',
    curriculumVersionId: '',
    edition: '2081 BS Edition',
    publicationYear: 2081,
  });

  // Chapters & Topics Editor Modal State
  const [selectedTbForChapters, setSelectedTbForChapters] = useState<any>(null);
  const [chaptersList, setChaptersList] = useState<any[]>([]);
  const [newChapterForm, setNewChapterForm] = useState({
    chapterNumber: 1,
    title: '',
    titleNepali: '',
    startPage: 1,
    endPage: 10,
    summary: '',
  });
  const [selectedChapterForTopic, setSelectedChapterForTopic] = useState<string>('');
  const [newTopicForm, setNewTopicForm] = useState({
    topicNumber: 1,
    title: '',
    startPage: 1,
    learningObjectives: '',
  });

  // ── Simulations & Activities State (Phase 7) ─────────────────
  const [adminSimulations, setAdminSimulations] = useState<any[]>([]);
  const [adminActivities, setAdminActivities] = useState<any[]>([]);
  const [simFilterGrade, setSimFilterGrade] = useState<string>('');
  const [simFilterSubject, setSimFilterSubject] = useState<string>('');
  const [simActiveSubTab, setSimActiveSubTab] = useState<'SIMS' | 'ACTIVITIES'>('SIMS');
  const [previewSim, setPreviewSim] = useState<any>(null);
  const [playerActivity, setPlayerActivity] = useState<any>(null);
  const [isAddSimModalOpen, setIsAddSimModalOpen] = useState(false);
  const [newSimForm, setNewSimForm] = useState({
    code: '',
    title: '',
    titleNepali: '',
    description: '',
    learningObjectives: '',
    gradeLevels: '10',
    subjectCode: 'SCI',
    language: 'both',
    simulationType: '2D_CANVAS',
    runtimeUrl: '',
    isPublished: true,
  });

  const { toast, confirm, prompt } = useDialogs();
  const [navOpen, setNavOpen] = useState(false);
  // the drawer closes whenever a tab is chosen
  useEffect(() => {
    setNavOpen(false);
  }, [activeTab]);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'CURRICULUM') {
      loadCurriculumData();
    }
    if (activeTab === 'SIMULATIONS') {
      loadSimulationsAndActivities();
    }
    if (activeTab === 'SUBSCRIPTIONS') {
      loadSubscriptionData();
    }
  }, [activeTab, selectedGrade, selectedMedium, textbookSearch, simFilterGrade, simFilterSubject]);

  const loadSubscriptionData = async () => {
    try {
      const [plansRes, invoicesRes, renewalsRes, historyRes] = await Promise.all([
        api.get('/subscriptions/plans?all=true'),
        api.get('/subscriptions/invoices'),
        api.get('/subscriptions/renewals/dashboard'),
        api.get('/subscriptions/history'),
      ]);
      setPlans(Array.isArray(plansRes) ? plansRes : []);
      setInvoices(Array.isArray(invoicesRes) ? invoicesRes : []);
      setRenewalDashboard(renewalsRes || null);
      setSubHistory(Array.isArray(historyRes) ? historyRes : []);
    } catch (e) {
      console.error('Failed to load subscription data:', e);
    }
  };

  const handleAssignSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.institutionId || !assignForm.planId) {
      toast('Please select both an institution and a package');
      return;
    }
    try {
      await api.post('/subscriptions/assign', assignForm);
      toast('Subscription assigned and invoice generated successfully!');
      setIsAssignModalOpen(false);
      loadSubscriptionData();
    } catch (err: any) {
      toast(err.message || 'Failed to assign subscription');
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    try {
      await api.put(`/subscriptions/plans/${editingPlan._id || editingPlan.id}`, {
        name: editingPlan.name,
        description: editingPlan.description,
        pricing: editingPlan.pricing,
        isActive: editingPlan.isActive,
      });
      toast('Package pricing and details updated!');
      setIsEditPlanModalOpen(false);
      loadSubscriptionData();
    } catch (err: any) {
      toast(err.message || 'Failed to update plan');
    }
  };

  const handleExtendSubscription = async (subId: string) => {
    const months = await prompt('Enter additional months to extend (e.g. 12 or 6):', { title: 'Extend subscription', defaultValue: '12', confirmLabel: 'Extend' });
    if (!months || !(Number(months) > 0)) return;
    try {
      await api.post(`/subscriptions/${subId}/extend`, { additionalMonths: Number(months) });
      toast(`Subscription extended by ${months} months!`);
      loadSubscriptionData();
    } catch (err: any) {
      toast(err.message || 'Failed to extend subscription');
    }
  };

  const handleToggleSuspend = async (subId: string, currentStatus: string) => {
    try {
      if (currentStatus === 'SUSPENDED') {
        await api.post(`/subscriptions/${subId}/activate`, { reason: 'Reactivated by Super Admin' });
        toast('Subscription reactivated!');
      } else {
        const reason = await prompt('Reason for suspension:', { title: 'Suspend subscription', defaultValue: 'Administrative compliance pending', confirmLabel: 'Suspend', danger: true });
        if (!reason) return;
        await api.post(`/subscriptions/${subId}/suspend`, { reason });
        toast('Subscription suspended.');
      }
      loadSubscriptionData();
    } catch (err: any) {
      toast(err.message || 'Action failed');
    }
  };

  const loadSimulationsAndActivities = async () => {
    try {
      let simUrl = '/simulation-activity/simulations?isPublished=all';
      if (simFilterGrade) simUrl += `&grade=${simFilterGrade}`;
      if (simFilterSubject) simUrl += `&subjectCode=${simFilterSubject}`;

      let actUrl = '/simulation-activity/activities?isPublished=all';
      if (simFilterGrade) actUrl += `&grade=${simFilterGrade}`;
      if (simFilterSubject) actUrl += `&subjectCode=${simFilterSubject}`;

      const [simulations, activities] = await Promise.all([
        api.get<any[]>(simUrl),
        api.get<any[]>(actUrl)
      ]);

      setAdminSimulations(Array.isArray(simulations) ? simulations : []);
      setAdminActivities(Array.isArray(activities) ? activities : []);
    } catch (e) {
      console.error('Failed to load simulations/activities', e);
      setAdminSimulations([]);
      setAdminActivities([]);
    }
  };

  const handleCreateSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const grades = newSimForm.gradeLevels.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      const objs = newSimForm.learningObjectives.split('\n').map(s => s.trim()).filter(Boolean);

      await api.post('/simulation-activity/simulations', {
        code: newSimForm.code || `SIM-${Date.now()}`,
        title: newSimForm.title,
        titleNepali: newSimForm.titleNepali,
        description: newSimForm.description,
        learningObjectives: objs,
        gradeLevels: grades.length > 0 ? grades : [10],
        subjectCode: newSimForm.subjectCode,
        language: newSimForm.language,
        simulationType: newSimForm.simulationType,
        runtimeUrl: newSimForm.runtimeUrl,
        isPublished: newSimForm.isPublished,
      });

      setIsAddSimModalOpen(false);
      setNewSimForm({
        code: '',
        title: '',
        titleNepali: '',
        description: '',
        learningObjectives: '',
        gradeLevels: '10',
        subjectCode: 'SCI',
        language: 'both',
        simulationType: '2D_CANVAS',
        runtimeUrl: '',
        isPublished: true,
      });
      loadSimulationsAndActivities();
      toast('Simulation registered successfully!');
    } catch (e: any) {
      toast('Error creating simulation: ' + e.message);
    }
  };

  const handleTogglePublishSim = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/simulation-activity/simulations/${id}/publish`, { isPublished: !currentStatus });
      loadSimulationsAndActivities();
    } catch (e: any) {
      toast('Failed to update status: ' + e.message);
    }
  };

  const handleTogglePublishAct = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/simulation-activity/activities/${id}/publish`, { isPublished: !currentStatus });
      loadSimulationsAndActivities();
    } catch (e: any) {
      toast('Failed to update status: ' + e.message);
    }
  };

  const handleDeleteSim = async (id: string) => {
    if (!(await confirm('Are you sure you want to delete this simulation?', { title: 'Delete simulation?', confirmLabel: 'Delete', danger: true }))) return;
    try {
      await api.delete(`/simulation-activity/simulations/${id}`);
      loadSimulationsAndActivities();
    } catch (e: any) {
      toast('Failed to delete simulation: ' + e.message);
    }
  };

  const loadDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    setIsRefreshing(true);
    try {
      if (silent) {
        // The 15-second background refresh only updates the headline numbers. It must not touch the institutions
        // table, otherwise it wipes the user's search/filter and sends them back to page 1.
        setStats(await api.get('/admin/overview'));
        setLastSyncTime(new Date());
        return;
      }
      const [overviewData, instData, optionData] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/institutions?limit=20'),
        api.get('/admin/institutions?limit=500').catch(() => null),
      ]);
      setInstitutionOptions((optionData as any)?.items || (instData as any).items || []);
      setStats(overviewData);
      setInstitutions(instData.items || []);
      setInstTotal(instData.total ?? (instData.items || []).length);
      setInstTotalPages(instData.totalPages || 1);
      setInstPage(1);
      setLastSyncTime(new Date());
    } catch (err: any) {
      console.error('Failed to load super admin data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleQuickApproveRequest = async (reqId: string, instName: string) => {
    if (!(await confirm(`Approve and execute atomic 12-step provisioning pipeline for "${instName}"?`, { title: 'Approve institution?', confirmLabel: 'Approve & provision' }))) return;
    try {
      await api.patch(`/admin/registration-requests/${reqId}/approve`, {});
      toast(`Institution "${instName}" successfully approved, provisioned, and activated!`);
      loadDashboardData();
    } catch (err: any) {
      toast(err.message || 'Failed to approve registration request');
    }
  };

  const loadCurriculumData = async () => {
    setCurriculumLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedGrade) params.append('grade', selectedGrade);
      if (selectedMedium) params.append('medium', selectedMedium);
      if (textbookSearch) params.append('search', textbookSearch);
      params.append('limit', '50');

      const [tbRes, subRes, verRes] = await Promise.all([
        api.get(`/curriculum/textbooks?${params.toString()}`),
        api.get('/curriculum/subjects'),
        api.get('/curriculum/versions'),
      ]);

      setTextbooks(tbRes.textbooks || []);
      setSubjects(subRes || []);
      setVersions(verRes || []);
      if (!uploadFormData.subjectId && subRes && subRes.length > 0) {
        setUploadFormData((prev) => ({ ...prev, subjectId: subRes[0].id || subRes[0]._id }));
      }
    } catch (err: any) {
      console.error('Failed to load curriculum data:', err);
    } finally {
      setCurriculumLoading(false);
    }
  };

  const handleScanAndIngest = async () => {
    if (!(await confirm('Scan and automatically ingest 141 official CDC textbooks from "Nepal data/"? This will detect chapters, topics, and compute SHA-256 hashes.', { title: 'Scan the textbook folder?', confirmLabel: 'Scan & ingest' }))) {
      return;
    }
    setIsIngesting(true);
    try {
      const res = await api.post('/curriculum/ingest-nepal-data');
      setIngestStats(res);
      toast(`CDC Curriculum Ingest Completed!\nTotal Found: ${res.totalFound}\nIngested: ${res.ingested}\nSkipped Duplicate: ${res.skippedDuplicate}\nFailed: ${res.failed}`);
      loadCurriculumData();
    } catch (err: any) {
      toast(`Ingest error: ${err.message || 'Failed to ingest CDC library'}`);
    } finally {
      setIsIngesting(false);
    }
  };

  const handleUploadTextbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toast('Please select a PDF file to upload.');
      return;
    }

    try {
      const data = new FormData();
      data.append('pdf', uploadFile);
      data.append('title', uploadFormData.title);
      data.append('titleNepali', uploadFormData.titleNepali);
      data.append('gradeNumber', uploadFormData.gradeNumber);
      data.append('medium', uploadFormData.medium);
      data.append('subjectId', uploadFormData.subjectId);
      data.append('edition', uploadFormData.edition);
      data.append('publicationYear', String(uploadFormData.publicationYear));

      await api.postFormData('/curriculum/textbooks', data);
      toast('Textbook uploaded and background document processing pipeline initiated!');
      setIsUploadModalOpen(false);
      setUploadFile(null);
      loadCurriculumData();
    } catch (err: any) {
      toast(err.message || 'Failed to upload textbook');
    }
  };

  const openChaptersEditor = async (tb: any) => {
    setSelectedTbForChapters(tb);
    try {
      const detailed = await api.get(`/curriculum/textbooks/${tb.id || tb._id}`);
      setChaptersList(detailed.detailedChapters || []);
      setNewChapterForm({
        chapterNumber: (detailed.detailedChapters || []).length + 1,
        title: '',
        titleNepali: '',
        startPage: 1,
        endPage: 10,
        summary: '',
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTbForChapters) return;
    try {
      await api.post(`/curriculum/textbooks/${selectedTbForChapters.id || selectedTbForChapters._id}/chapters`, newChapterForm);
      toast('Chapter added successfully');
      openChaptersEditor(selectedTbForChapters);
    } catch (err: any) {
      toast(err.message || 'Failed to add chapter');
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapterForTopic) return;
    try {
      const objectives = newTopicForm.learningObjectives
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.post(`/curriculum/chapters/${selectedChapterForTopic}/topics`, {
        topicNumber: newTopicForm.topicNumber,
        title: newTopicForm.title,
        startPage: newTopicForm.startPage,
        learningObjectives: objectives,
      });
      toast('Topic added successfully');
      setSelectedChapterForTopic('');
      openChaptersEditor(selectedTbForChapters);
    } catch (err: any) {
      toast(err.message || 'Failed to add topic');
    }
  };

  const handleDeleteTextbook = async (id: string, title: string) => {
    if (!(await confirm(`Delete textbook "${title}" and all its chapters?`, { title: 'Delete textbook?', confirmLabel: 'Delete', danger: true }))) return;
    try {
      await api.delete(`/curriculum/textbooks/${id}`);
      toast('Textbook removed');
      loadCurriculumData();
    } catch (err: any) {
      toast(err.message || 'Failed to delete');
    }
  };

  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/institutions', newInst);
      toast('Institution created and Admin provisioned successfully!');
      setIsCreateModalOpen(false);
      loadDashboardData();
    } catch (err: any) {
      toast(err.message || 'Error creating institution');
    }
  };

  const handleValidateImport = async () => {
    try {
      const lines = importRows.trim().split('\n');
      if (lines.length <= 1) {
        toast('Please provide CSV rows including header');
        return;
      }
      const headers = lines[0].split(',').map((h) => h.trim());
      const records = lines.slice(1).map((line) => {
        const parts = line.split(',').map((p) => p.trim());
        const obj: any = {};
        headers.forEach((h, i) => (obj[h] = parts[i]));
        return obj;
      });

      const preview = await api.post('/admin/institutions/import/validate', { institutions: records });
      setImportPreview(preview);
    } catch (err: any) {
      toast(err.message || 'Validation failed');
    }
  };

  const handleExecuteImport = async () => {
    if (!importPreview || !importPreview.validRows) return;
    try {
      const result = await api.post('/admin/institutions/import/execute', { institutions: importPreview.validRows });
      setImportResult(result);
      toast(`Import completed! Created: ${result.successCount}, Failed: ${result.failedCount}`);
      loadDashboardData();
    } catch (err: any) {
      toast(err.message || 'Import execution failed');
    }
  };

  // Search / province filtering and paging happen on the server so every institution is reachable
  const filteredInstitutions = institutions;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    setInstPage(1);
  }, [debouncedSearch, filterProvince]);

  useEffect(() => {
    let cancelled = false;
    const q = new URLSearchParams({ page: String(instPage), limit: '20' });
    if (debouncedSearch) q.set('search', debouncedSearch);
    if (filterProvince) q.set('province', filterProvince);
    api
      .get<any>(`/admin/institutions?${q.toString()}`)
      .then((res) => {
        if (cancelled) return;
        setInstitutions(res.items || []);
        setInstTotal(res.total ?? (res.items || []).length);
        setInstTotalPages(res.totalPages || 1);
      })
      .catch((err) => console.error('Failed to load institutions', err));
    return () => {
      cancelled = true;
    };
  }, [instPage, debouncedSearch, filterProvince]);

  const NAV_GROUPS: Array<{ label: string; items: Array<{ key: typeof activeTab; label: string; icon: React.ComponentType<any> }> }> = [
    { label: 'Overview', items: [{ key: 'OVERVIEW', label: 'Central Overview', icon: Building2 }, { key: 'PLATFORM', label: 'Platform Operations', icon: TrendingUp }] },
    { label: 'Institutions', items: [{ key: 'INSTITUTIONS', label: 'Institutions Directory', icon: Building2 }, { key: 'REQUESTS', label: 'Registration Requests', icon: ShieldCheck }, { key: 'PROVISIONING_HISTORY', label: 'Provisioning Audit Logs', icon: Clock }, { key: 'IMPORT', label: 'Bulk Onboarding', icon: FileSpreadsheet }] },
    { label: 'Curriculum & Learning', items: [{ key: 'LIBRARY', label: 'Nepal Curriculum & Textbook Library', icon: Layers }, { key: 'CURRICULUM', label: 'Textbook Uploads & Chapters', icon: BookOpen }, { key: 'SIMULATIONS', label: 'Simulations & Activities', icon: Sparkles }, { key: 'AI_INDEX', label: 'AI Knowledge Index', icon: BookCheck }] },
    { label: 'Administration', items: [{ key: 'USERS', label: 'Users & Audit Log', icon: Users }, { key: 'SUBSCRIPTIONS', label: 'Subscriptions & Licensing', icon: CreditCard }, { key: 'SECURITY', label: 'Account Security', icon: ShieldCheck }] },
  ];
  const currentNav = NAV_GROUPS.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label }))).find((i) => i.key === activeTab);

  // Escape closes the slide-in menu on small screens
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navOpen]);

  return (
    <div className="sa-root" style={{ display: 'flex', minHeight: '100vh', background: '#f4faf8', color: '#0e3e3b' }}>
      <div className={`sa-overlay${navOpen ? ' is-open' : ''}`} onClick={() => setNavOpen(false)} aria-hidden="true" />
      {/* Sidebar Navigation */}
      <div className={`sa-sidebar${navOpen ? ' is-open' : ''}`} role="navigation" aria-label="Super Admin navigation" style={{ width: '260px', background: '#ffffff', borderRight: '1px solid #dcebe6', color: '#0e3e3b', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #dcebe6' }}>
          <img src="/brand/logo/logo-horizontal.svg" alt="Nepal Digital Education Platform" style={{ height: '40px', width: 'auto', maxWidth: '100%', display: 'block' }} />
          <div style={{ fontSize: '11px', color: '#5f736f', fontWeight: 700, marginTop: '8px', letterSpacing: '0.04em' }}>Central Super Admin</div>
        </div>

        <nav aria-label="Sections" style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          {NAV_GROUPS.map((g) => (
            <div key={g.label}>
              <div className="sa-nav-label">{g.label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                {g.items.map((it) => {
                  const active = activeTab === it.key;
                  const Icon = it.icon;
                  const badge = it.key === 'REQUESTS' ? Number(stats?.requests?.pending || stats?.stats?.pendingRequests || 0) : 0;
                  return (
                    <button
                      key={it.key}
                      type="button"
                      className={`sa-nav-item${active ? ' is-active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                      aria-label={badge ? `${it.label}, ${badge} pending` : undefined}
                      onClick={() => setActiveTab(it.key)}
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span className="sa-nav-text">{it.label}</span>
                      {badge > 0 && <span className="sa-nav-badge">{badge}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid #dcebe6', background: '#f4faf8' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#117a6b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>
                SA
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0e3e3b' }}>Super Admin</div>
                <div style={{ fontSize: '11px', color: '#5f736f' }}>superadmin@nepaledu.gov.np</div>
              </div>
            </div>
            <button onClick={logout} style={{ color: '#ef4444', background: 'transparent', padding: '6px', cursor: 'pointer' }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="sa-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        <div className="sa-topbar">
          <button type="button" aria-label="Open navigation menu" aria-expanded={navOpen} onClick={() => setNavOpen(true)}>
            <Menu size={20} />
          </button>
          <div>
            <div className="sa-topbar-title">NEPAL EDU PLATFORM</div>
            <div className="sa-topbar-sub">Central Super Admin</div>
          </div>
        </div>
        <DemoBanner />
        <div className="sa-header" style={{ padding: '24px 32px', borderBottom: '1px solid #dcebe6', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="sa-crumb">Super Admin / {currentNav?.group}</div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>{currentNav?.label}</h2>
            <div style={{ fontSize: '12px', color: '#5f736f', marginTop: '2px' }}>
              Ministry of Education, Science and Technology • Curriculum Development Centre (CDC)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {activeTab === 'OVERVIEW' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5f736f', background: '#f4faf8', padding: '6px 12px', borderRadius: '8px', border: '1px solid #dcebe6' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#1fb589' }} />
                  <span>Real-time Sync • {formatTime(lastSyncTime)}</span>
                </div>

                <button
                  onClick={() => loadDashboardData(false)}
                  disabled={isRefreshing}
                  title="Force refresh realtime MongoDB metrics"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#ffffff',
                    border: '1px solid #cfdcd8',
                    color: '#2f4f4c',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                  <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>

                <button
                  onClick={() => setIsProvisioningWizardOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#117a6b',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  <Plus size={16} /> Direct Provisioning Wizard
                </button>
              </>
            )}

            {(activeTab === 'INSTITUTIONS' || activeTab === 'REQUESTS') && (
              <button
                onClick={() => setIsProvisioningWizardOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#117a6b',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <Plus size={16} /> Register New School / College
              </button>
            )}

            {activeTab === 'CURRICULUM' && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleScanAndIngest}
                  disabled={isIngesting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#117a6b',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                  }}
                  title="Scan & ingest all 141 CDC textbooks from Nepal data folder"
                >
                  <RefreshCw size={16} className={isIngesting ? 'animate-spin' : ''} />
                  {isIngesting ? 'Ingesting CDC Data...' : '⚡ Scan & Ingest 141 CDC Books'}
                </button>

                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#117a6b',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                  }}
                >
                  <UploadCloud size={16} /> Upload Textbook PDF
                </button>
              </div>
            )}

            {activeTab === 'SIMULATIONS' && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setIsAddSimModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#117a6b',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} /> Register Simulation
                </button>
              </div>
            )}

            {activeTab === 'SUBSCRIPTIONS' && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#117a6b',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} /> Assign Subscription to School
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="sa-content" style={{ padding: '32px', flex: 1 }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && loading && !stats && (
            <div aria-busy="true" aria-label="Loading overview">
              <div className="sa-skel" style={{ height: 72, marginBottom: 20 }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 24 }}>
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="sa-skel" style={{ height: 110 }} />)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
                <div className="sa-skel" style={{ height: 280 }} />
                <div className="sa-skel" style={{ height: 280 }} />
              </div>
            </div>
          )}
          {activeTab === 'OVERVIEW' && !(loading && !stats) && (() => {
            const totalInstCount = stats?.institutions?.total ?? stats?.stats?.totalInstitutions ?? institutions.length ?? 0;
            const activeInstCount = stats?.institutions?.active ?? stats?.stats?.activeInstitutions ?? institutions.length ?? 0;
            const totalTeacherCount = stats?.users?.teachers ?? stats?.stats?.totalTeachers ?? 0;
            const totalStudentCount = stats?.users?.students ?? stats?.stats?.totalStudents ?? 0;
            // Server total, not the length of whichever (50-item) page of textbooks happens to be loaded
            const totalBookCount = stats?.stats?.totalTextbooks ?? textbooks.length ?? 0;
            const collegeCount = stats?.institutions?.colleges ?? stats?.stats?.totalColleges ?? 0;
            const pendingReqCount = stats?.requests?.pending ?? stats?.stats?.pendingRequests ?? 0;
            const recentReqList = stats?.requests?.recent || [];

            const provinceChartData = [
              { province: 'Koshi', institutions: stats?.charts?.provinceDistribution?.['Koshi Province'] || 0, fill: '#6d4fd6' },
              { province: 'Madhesh', institutions: stats?.charts?.provinceDistribution?.['Madhesh Province'] || 0, fill: '#f08a3c' },
              { province: 'Bagmati', institutions: (stats?.charts?.provinceDistribution?.['Bagmati Province'] || 0) + (stats?.charts?.provinceDistribution?.['Bagmati'] || 0), fill: '#d4a017' },
              { province: 'Gandaki', institutions: stats?.charts?.provinceDistribution?.['Gandaki Province'] || 0, fill: '#8a6bd9' },
              { province: 'Lumbini', institutions: stats?.charts?.provinceDistribution?.['Lumbini Province'] || 0, fill: '#c4559f' },
              { province: 'Karnali', institutions: stats?.charts?.provinceDistribution?.['Karnali Province'] || 0, fill: '#f1b434' },
              { province: 'Sudurpashchim', institutions: stats?.charts?.provinceDistribution?.['Sudurpashchim Province'] || 0, fill: '#e5533d' },
            ];

            const typeChartData = [
              { name: 'Community (सामुदायिक)', value: stats?.institutions?.schools ?? 0, color: '#6d4fd6' },
              { name: 'Higher Ed Colleges (कलेज)', value: collegeCount, color: '#f1b434' },
              { name: 'Institutional / Private (संस्थागत)', value: stats?.charts?.typeDistribution?.INSTITUTIONAL ?? 0, color: '#c4559f' },
            ];

            const growthChartData: Array<{ month: string; institutions: number; students: number }> =
              stats?.charts?.growthTrend || [];

            return (
              <div>
                {/* Pending Requests Alert Banner */}
                {pendingReqCount > 0 && (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                      border: '1.5px solid #ddd6fe',
                      borderRadius: '14px',
                      padding: '16px 20px',
                      marginBottom: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 12px rgba(109,91,208, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: '#6d5bd0',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: '0 2px 8px rgba(109,91,208, 0.3)',
                        }}
                      >
                        <AlertCircle size={22} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '15px', color: '#3b2f8f' }}>
                          Action Required: {pendingReqCount} Institution Self-Registration{pendingReqCount > 1 ? 's' : ''} Awaiting Approval
                        </div>
                        <div style={{ fontSize: '12px', color: '#4c3fa8', marginTop: '2px' }}>
                          Verified application forms submitted via the public registration portal require Super Admin approval & automated provisioning.
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setActiveTab('REQUESTS')}
                        style={{
                          padding: '9px 18px',
                          borderRadius: '8px',
                          background: '#4c3fa8',
                          color: '#ffffff',
                          border: 'none',
                          fontWeight: '800',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 4px rgba(180, 83, 9, 0.25)',
                        }}
                      >
                        <span>Open Approvals Queue</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Real-time Metric Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', marginBottom: '28px' }}>
                  {/* Card 1: Institutions */}
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '20px',
                      borderRadius: '14px',
                      border: '1px solid #dcebe6',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f', textTransform: 'uppercase' }}>Institutions</span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e6f7f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building2 size={18} color="#117a6b" />
                      </div>
                    </div>
                    <div style={{ fontSize: '30px', fontWeight: '900', color: '#0e3e3b', letterSpacing: '-0.5px' }}>
                      {totalInstCount}
                    </div>
                    <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} /> {activeInstCount} active nationwide
                    </div>
                  </div>

                  {/* Card 2: Teachers */}
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '20px',
                      borderRadius: '14px',
                      border: '1px solid #dcebe6',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f', textTransform: 'uppercase' }}>Teachers</span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e6f7f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={18} color="#117a6b" />
                      </div>
                    </div>
                    <div style={{ fontSize: '30px', fontWeight: '900', color: '#0e3e3b', letterSpacing: '-0.5px' }}>
                      {totalTeacherCount}
                    </div>
                    <div style={{ fontSize: '12px', color: '#5f736f', marginTop: '4px', fontWeight: '600' }}>
                      Across all school faculties
                    </div>
                  </div>

                  {/* Card 3: Students */}
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '20px',
                      borderRadius: '14px',
                      border: '1px solid #dcebe6',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f', textTransform: 'uppercase' }}>Students</span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={18} color="#6d5bd0" />
                      </div>
                    </div>
                    <div style={{ fontSize: '30px', fontWeight: '900', color: '#0e3e3b', letterSpacing: '-0.5px' }}>
                      {totalStudentCount}
                    </div>
                    <div style={{ fontSize: '12px', color: '#5f736f', marginTop: '4px', fontWeight: '600' }}>
                      Active digital identities
                    </div>
                  </div>

                  {/* Card 4: CDC Textbooks */}
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '20px',
                      borderRadius: '14px',
                      border: '1px solid #dcebe6',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f', textTransform: 'uppercase' }}>CDC Books</span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={18} color="#7c3aed" />
                      </div>
                    </div>
                    <div style={{ fontSize: '30px', fontWeight: '900', color: '#0e3e3b', letterSpacing: '-0.5px' }}>
                      {totalBookCount}
                    </div>
                    <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px', fontWeight: '700' }}>
                      Grades 1–12 Bilingual
                    </div>
                  </div>

                  {/* Card 5: Higher Ed Colleges */}
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '20px',
                      borderRadius: '14px',
                      border: '1px solid #dcebe6',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f', textTransform: 'uppercase' }}>Colleges</span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building2 size={18} color="#4f46e5" />
                      </div>
                    </div>
                    <div style={{ fontSize: '30px', fontWeight: '900', color: '#0e3e3b', letterSpacing: '-0.5px' }}>
                      {collegeCount}
                    </div>
                    <div style={{ fontSize: '12px', color: '#4f46e5', marginTop: '4px', fontWeight: '700' }}>
                      TU & Higher Ed Affiliates
                    </div>
                  </div>

                  {/* Card 6: Pending Requests */}
                  <div
                    onClick={() => setActiveTab('REQUESTS')}
                    style={{
                      background: pendingReqCount > 0 ? '#f5f3ff' : '#ffffff',
                      padding: '20px',
                      borderRadius: '14px',
                      border: pendingReqCount > 0 ? '1.5px solid #ddd6fe' : '1px solid #dcebe6',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: pendingReqCount > 0 ? '#4c3fa8' : '#5f736f', textTransform: 'uppercase' }}>
                        Approvals Queue
                      </span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: pendingReqCount > 0 ? '#ddd6fe' : '#ebf5f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertCircle size={18} color={pendingReqCount > 0 ? '#6d5bd0' : '#5f736f'} />
                      </div>
                    </div>
                    <div style={{ fontSize: '30px', fontWeight: '900', color: pendingReqCount > 0 ? '#4c3fa8' : '#0e3e3b', letterSpacing: '-0.5px' }}>
                      {pendingReqCount}
                    </div>
                    <div style={{ fontSize: '12px', color: pendingReqCount > 0 ? '#6d5bd0' : '#5f736f', marginTop: '4px', fontWeight: '700' }}>
                      {pendingReqCount > 0 ? 'Click to Review →' : 'All Requests Cleared'}
                    </div>
                  </div>
                </div>

                {/* Platform-wide Digital Learning & Curriculum Activity */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #dcebe6',
                    padding: '24px',
                    marginBottom: '28px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', background: '#e6f7f0', color: '#117a6b', padding: '2px 8px', borderRadius: '4px' }}>
                          NATIONWIDE ACADEMIC ADOPTION
                        </span>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                          Digital Classroom Activity & Curriculum Delivery
                        </h3>
                      </div>
                      <p style={{ fontSize: '13px', color: '#5f736f', margin: '4px 0 0 0' }}>
                        Real-time tracking of teacher and student engagement across Nepal K–12 schools and higher education colleges.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#117a6b', background: '#effaf6', padding: '4px 12px', borderRadius: '20px', border: '1px solid #bbf7d0' }}>
                        Live Synchronized
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    <div style={{ background: '#f4faf8', padding: '16px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                      <div style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700' }}>CDC Formative Quizzes</div>
                      <div style={{ fontSize: '26px', fontWeight: '900', color: '#117a6b', margin: '6px 0 2px 0' }}>
                        {stats?.learningMetrics?.totalQuizzes ?? stats?.stats?.totalQuizzes ?? 2}
                      </div>
                      <div style={{ fontSize: '11px', color: '#5f736f' }}>Active test banks & formative quizzes</div>
                    </div>

                    <div style={{ background: '#f4faf8', padding: '16px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                      <div style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700' }}>Teacher Study Materials</div>
                      <div style={{ fontSize: '26px', fontWeight: '900', color: '#117a6b', margin: '6px 0 2px 0' }}>
                        {stats?.learningMetrics?.totalMaterials ?? stats?.stats?.totalMaterials ?? 4}
                      </div>
                      <div style={{ fontSize: '11px', color: '#5f736f' }}>Handouts, worksheets & lecture notes</div>
                    </div>

                    <div style={{ background: '#f4faf8', padding: '16px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                      <div style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700' }}>Homework Submissions</div>
                      <div style={{ fontSize: '26px', fontWeight: '900', color: '#7c3aed', margin: '6px 0 2px 0' }}>
                        {stats?.learningMetrics?.totalSubmissions ?? stats?.stats?.totalSubmissions ?? 5}
                      </div>
                      <div style={{ fontSize: '11px', color: '#5f736f' }}>Evaluated continuous assessment work</div>
                    </div>

                    <div style={{ background: '#f4faf8', padding: '16px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                      <div style={{ fontSize: '12px', color: '#5f736f', fontWeight: '700' }}>Smart Board Annotations</div>
                      <div style={{ fontSize: '26px', fontWeight: '900', color: '#6d5bd0', margin: '6px 0 2px 0' }}>
                        {stats?.learningMetrics?.totalSharedNotes ?? stats?.stats?.totalSharedNotes ?? 2}
                      </div>
                      <div style={{ fontSize: '11px', color: '#5f736f' }}>Canvas whiteboard captures saved</div>
                    </div>
                  </div>
                </div>

                {/* 3D-Styled Interactive Charts Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '28px' }}>
                  {/* Left Chart: Province Distribution */}
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '24px',
                      borderRadius: '16px',
                      border: '1px solid #dcebe6',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                          Province-wise Institutional Footprint
                        </h3>
                        <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0' }}>
                          Active educational institutions distributed across all 7 Provinces of Nepal
                        </p>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#117a6b', background: '#e6f7f0', padding: '3px 8px', borderRadius: '6px' }}>
                        7 Provinces
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '240px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={provinceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            {provinceChartData.map((p, idx) => (
                              <linearGradient key={idx} id={`barGrad${idx}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={p.fill} stopOpacity={1} />
                                <stop offset="100%" stopColor={p.fill} stopOpacity={0.65} />
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebf5f1" />
                          <XAxis dataKey="province" tick={{ fontSize: 11, fill: '#5f736f' }} axisLine={{ stroke: '#dcebe6' }} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#5f736f' }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #dcebe6', color: '#0e3e3b', fontSize: '12px', boxShadow: '0 10px 24px -8px rgba(14, 62, 59, 0.18)' }}
                            cursor={{ fill: '#f4faf8' }}
                          />
                          <Bar dataKey="institutions" radius={[6, 6, 0, 0]}>
                            {provinceChartData.map((_, idx) => (
                              <Cell key={`cell-${idx}`} fill={`url(#barGrad${idx})`} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Right Chart: Classification Donut */}
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '24px',
                      borderRadius: '16px',
                      border: '1px solid #dcebe6',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                        Institution Classification
                      </h3>
                      <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0' }}>
                        Community vs Institutional vs Higher Ed
                      </p>
                    </div>

                    <div style={{ width: '100%', height: '170px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={typeChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={48}
                            outerRadius={72}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {typeChartData.map((entry, index) => (
                              <Cell key={`slice-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #dcebe6', color: '#0e3e3b', fontSize: '12px', boxShadow: '0 10px 24px -8px rgba(14, 62, 59, 0.18)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                      {typeChartData.map((t, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.color }} />
                            <span style={{ color: '#4b605b', fontWeight: '600' }}>{t.name}</span>
                          </div>
                          <span style={{ fontWeight: '800', color: '#0e3e3b' }}>{t.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Chart: Monthly Growth Trend */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid #dcebe6',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    marginBottom: '28px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                        Academic Ecosystem Expansion & Student Onboarding Trend
                      </h3>
                      <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0' }}>
                        Quarterly progression of provisioned institutions and registered student learners
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#6d4fd6' }} />
                        <span style={{ color: '#5f736f', fontWeight: '600' }}>Institutions</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f1b434' }} />
                        <span style={{ color: '#5f736f', fontWeight: '600' }}>Students</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ width: '100%', height: '180px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="areaInstGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6d4fd6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#6d4fd6" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="areaStudentGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f1b434" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#f1b434" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebf5f1" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#5f736f' }} axisLine={{ stroke: '#dcebe6' }} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#5f736f' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #dcebe6', color: '#0e3e3b', fontSize: '12px', boxShadow: '0 10px 24px -8px rgba(14, 62, 59, 0.18)' }} />
                        <Area type="monotone" dataKey="institutions" stroke="#6d4fd6" strokeWidth={2.5} fillOpacity={1} fill="url(#areaInstGrad)" />
                        <Area type="monotone" dataKey="students" stroke="#f1b434" strokeWidth={2.5} fillOpacity={1} fill="url(#areaStudentGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Live Incoming Self-Registrations Widget */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #dcebe6',
                    padding: '24px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    marginBottom: '28px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                          Incoming Institution Self-Registrations
                        </h3>
                        <span style={{ background: '#e6f7f0', color: '#117a6b', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
                          Live MongoDB Stream
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#5f736f', margin: '4px 0 0' }}>
                        Schools & colleges registering via public onboarding. Click Review to edit application details, or Approve to run the 12-step atomic provisioning pipeline.
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab('REQUESTS')}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '8px',
                        background: '#e6f7f0',
                        color: '#117a6b',
                        border: '1px solid #bfeede',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Manage All Requests</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6', color: '#4b605b', fontWeight: '700' }}>
                          <th style={{ padding: '10px 14px' }}>Ref & EMIS</th>
                          <th style={{ padding: '10px 14px' }}>Institution Name</th>
                          <th style={{ padding: '10px 14px' }}>Location</th>
                          <th style={{ padding: '10px 14px' }}>Contact Person</th>
                          <th style={{ padding: '10px 14px' }}>Status</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentReqList.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#5f736f' }}>
                              No self-registration applications in database yet. Visit the public registration page to submit one!
                            </td>
                          </tr>
                        ) : (
                          recentReqList.map((req: any) => {
                            const reqId = req.id || req._id;
                            const isPending = ['PENDING', 'SUBMITTED', 'UNDER_VERIFICATION', 'MORE_INFO_REQUIRED'].includes(req.status);
                            return (
                              <tr key={reqId} style={{ borderBottom: '1px solid #ebf5f1' }}>
                                <td style={{ padding: '10px 14px' }}>
                                  <div style={{ fontWeight: '800', color: '#117a6b', fontFamily: 'monospace' }}>
                                    {req.requestCode}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#5f736f', fontFamily: 'monospace' }}>
                                    EMIS: {req.emisCode}
                                  </div>
                                </td>

                                <td style={{ padding: '10px 14px' }}>
                                  <div style={{ fontWeight: '700', color: '#0e3e3b' }}>{req.institutionName}</div>
                                  <div style={{ fontSize: '11px', color: '#5f736f' }}>
                                    {req.institutionKind || 'SCHOOL'} • {req.institutionType || 'COMMUNITY'}
                                  </div>
                                </td>

                                <td style={{ padding: '10px 14px' }}>
                                  <div>{req.localLevel || req.district}</div>
                                  <div style={{ fontSize: '11px', color: '#5f736f' }}>{req.province}</div>
                                </td>

                                <td style={{ padding: '10px 14px' }}>
                                  <div style={{ fontWeight: '600' }}>{req.contactPerson}</div>
                                  <div style={{ fontSize: '11px', color: '#5f736f' }}>{req.phone || req.email}</div>
                                </td>

                                <td style={{ padding: '10px 14px' }}>
                                  <span
                                    style={{
                                      padding: '3px 8px',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      background: isPending ? '#ede9fe' : '#dcfce7',
                                      color: isPending ? '#4c3fa8' : '#16a34a',
                                      border: isPending ? '1px solid #ddd6fe' : '1px solid #bbf7d0',
                                    }}
                                  >
                                    {req.status}
                                  </span>
                                </td>

                                <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                                  <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                                    <button
                                      onClick={() => setActiveTab('REQUESTS')}
                                      style={{
                                        padding: '5px 10px',
                                        borderRadius: '6px',
                                        background: '#e6f7f0',
                                        color: '#117a6b',
                                        border: '1px solid #bfeede',
                                        fontWeight: '700',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      Review & Edit
                                    </button>

                                    {isPending && (
                                      <button
                                        onClick={() => handleQuickApproveRequest(reqId, req.institutionName)}
                                        style={{
                                          padding: '5px 10px',
                                          borderRadius: '6px',
                                          background: '#e6f7f0',
                                          color: '#117a6b',
                                          border: '1px solid #bfeede',
                                          fontWeight: '700',
                                          fontSize: '11px',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        Approve
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Digital Education Infrastructure Launchpad */}
                <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #dcebe6', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: '#0e3e3b' }}>
                    Digital Education National Core Systems
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    <div
                      onClick={() => setActiveTab('CURRICULUM')}
                      style={{ border: '1px solid #dcebe6', borderRadius: '10px', padding: '16px', cursor: 'pointer', background: '#f4faf8', transition: 'all 0.15s ease' }}
                    >
                      <div style={{ fontWeight: '800', fontSize: '13px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0e3e3b' }}>
                        <BookOpen size={16} color="#117a6b" /> CDC Curriculum Library
                      </div>
                      <div style={{ fontSize: '12px', color: '#5f736f' }}>
                        Manage Classes 1–12 textbooks, bilingual editions, chapters, and topics.
                      </div>
                    </div>

                    <div
                      onClick={() => setActiveTab('INSTITUTIONS')}
                      style={{ border: '1px solid #dcebe6', borderRadius: '10px', padding: '16px', cursor: 'pointer', background: '#f4faf8', transition: 'all 0.15s ease' }}
                    >
                      <div style={{ fontWeight: '800', fontSize: '13px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0e3e3b' }}>
                        <Building2 size={16} color="#117a6b" /> School Management
                      </div>
                      <div style={{ fontSize: '12px', color: '#5f736f' }}>
                        Monitor institutional status, EMIS sync, and administrator access.
                      </div>
                    </div>

                    <div
                      onClick={() => setActiveTab('PROVISIONING_HISTORY')}
                      style={{ border: '1px solid #dcebe6', borderRadius: '10px', padding: '16px', cursor: 'pointer', background: '#f4faf8', transition: 'all 0.15s ease' }}
                    >
                      <div style={{ fontWeight: '800', fontSize: '13px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0e3e3b' }}>
                        <Clock size={16} color="#6d5bd0" /> Provisioning Audit Logs
                      </div>
                      <div style={{ fontSize: '12px', color: '#5f736f' }}>
                        Detailed 12-step trace logs of institutional creation and batch imports.
                      </div>
                    </div>

                    <div
                      onClick={() => window.open('/smartboard/index.html', '_blank')}
                      style={{ border: '1px solid #dcebe6', borderRadius: '10px', padding: '16px', cursor: 'pointer', background: '#f4faf8', transition: 'all 0.15s ease' }}
                    >
                      <div style={{ fontWeight: '800', fontSize: '13px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0e3e3b' }}>
                        <Sparkles size={16} color="#7c3aed" /> Smart Board Integration
                      </div>
                      <div style={{ fontSize: '12px', color: '#5f736f' }}>
                        Interactive canvas, live textbook PDF stream, and PhET HTML5 simulations.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 2: INSTITUTIONS */}
          {activeTab === 'INSTITUTIONS' && (
            <div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#8da19d' }} />
                  <input
                    type="text"
                    placeholder="Search by school name, EMIS code, or district..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                  />
                </div>
                <select
                  value={filterProvince}
                  onChange={(e) => setFilterProvince(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px', background: '#ffffff' }}
                >
                  <option value="">All Provinces (7)</option>
                  <option value="Koshi Province">Koshi Province</option>
                  <option value="Madhesh Province">Madhesh Province</option>
                  <option value="Bagmati Province">Bagmati Province</option>
                  <option value="Gandaki Province">Gandaki Province</option>
                  <option value="Lumbini Province">Lumbini Province</option>
                  <option value="Karnali Province">Karnali Province</option>
                  <option value="Sudurpashchim Province">Sudurpashchim Province</option>
                </select>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6', color: '#5f736f', fontWeight: '600' }}>
                      <th style={{ padding: '12px 16px' }}>EMIS Code</th>
                      <th style={{ padding: '12px 16px' }}>Institution Name</th>
                      <th style={{ padding: '12px 16px' }}>Type</th>
                      <th style={{ padding: '12px 16px' }}>Location</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px' }}>Contact</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInstitutions.map((inst) => (
                      <tr key={inst.id || inst._id} style={{ borderBottom: '1px solid #ebf5f1', transition: 'background 0.15s ease' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '700', fontFamily: 'monospace' }}>{inst.emisCode}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div
                            onClick={() => {
                              setSelectedInstForManage(inst.id || inst._id);
                              setIsManageModalOpen(true);
                            }}
                            style={{
                              fontWeight: '700',
                              color: '#0f4c4a',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            title="Click to view full institution dossier & manage leadership"
                          >
                            <span>{inst.name}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#5f736f' }}>{inst.nameNepali}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', background: inst.type === 'COMMUNITY' ? '#effaf6' : '#e6f7f0', color: inst.type === 'COMMUNITY' ? '#16a34a' : '#117a6b' }}>
                            {inst.type}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div>{inst.localLevel}, {inst.district}</div>
                          <div style={{ fontSize: '11px', color: '#5f736f' }}>{inst.province}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} /> {inst.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '12px', color: '#5f736f' }}>
                          <div>{inst.email}</div>
                          <div>{inst.phone}</div>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setSelectedInstForManage(inst.id || inst._id);
                              setIsManageModalOpen(true);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              background: '#e6f7f0',
                              color: '#0f5f55',
                              border: '1px solid #bfeede',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            title="Inspect subscriptions, faculty roster, edit institution and assign leadership"
                          >
                            <Edit size={13} /> Manage & Leadership
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredInstitutions.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#5f736f', fontSize: '13px' }}>No institutions match.</div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', fontSize: '12px', color: '#5f736f' }}>
                <button disabled={instPage <= 1} onClick={() => setInstPage((p) => p - 1)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cfdcd8', background: '#fff', cursor: 'pointer' }}>Previous</button>
                <span>Page {instPage} of {instTotalPages} • {instTotal} institutions</span>
                <button disabled={instPage >= instTotalPages} onClick={() => setInstPage((p) => p + 1)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cfdcd8', background: '#fff', cursor: 'pointer' }}>Next</button>
              </div>
            </div>
          )}

          {/* TAB: REQUESTS (Self-Registration Queue) */}
          {activeTab === 'REQUESTS' && (
            <RegistrationRequestsManager />
          )}

          {/* TAB: PROVISIONING_HISTORY */}
          {activeTab === 'PROVISIONING_HISTORY' && (
            <ProvisioningHistoryManager />
          )}

          {/* TAB 3: IMPORT */}
          {activeTab === 'USERS' && <UserManagementPanel />}

          {activeTab === 'IMPORT' && <BulkInstitutionImport onDone={() => loadDashboardData()} />}

          {/* TAB 4: CURRICULUM & DIGITAL TEXTBOOKS */}
          {activeTab === 'LIBRARY' && <CurriculumLibraryPanel />}

          {activeTab === 'CURRICULUM' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: '#117a6b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={16} /> Upload New CDC Textbook PDF
                </button>
                <button
                  onClick={handleScanAndIngest}
                  disabled={isIngesting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: '#f4faf8',
                    color: '#0e3e3b',
                    border: '1px solid #cfdcd8',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: isIngesting ? 'not-allowed' : 'pointer',
                  }}
                >
                  <RefreshCw size={14} className={isIngesting ? 'animate-spin' : ''} />
                  <span>{isIngesting ? 'Scanning Nepal data/…' : 'Re-sync Nepal data/ Folder'}</span>
                </button>
              </div>

              <ClassTextbookBrowser
                theme="blue"
                title="Super Admin: Classes 1–12 Digital Textbook & Curriculum PDF Management"
                subtitle="Browse, inspect, and read all official national textbooks across Classes 1–12 stored in the Nepal data/ folders with English and Nepali medium sorting."
              />
            </div>
          )}

          {/* TAB 5: SIMULATIONS & INTERACTIVE ACTIVITIES (PHASE 7) */}
          {activeTab === 'SIMULATIONS' && (
            <div>
              {/* Sub-tab & Filters */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', background: '#dcebe6', padding: '4px', borderRadius: '10px' }}>
                  <button
                    onClick={() => setSimActiveSubTab('SIMS')}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      background: simActiveSubTab === 'SIMS' ? '#ffffff' : 'transparent',
                      color: simActiveSubTab === 'SIMS' ? '#134744' : '#5f736f',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: simActiveSubTab === 'SIMS' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    🎮 Simulations Library ({adminSimulations.length})
                  </button>
                  <button
                    onClick={() => setSimActiveSubTab('ACTIVITIES')}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      background: simActiveSubTab === 'ACTIVITIES' ? '#ffffff' : 'transparent',
                      color: simActiveSubTab === 'ACTIVITIES' ? '#134744' : '#5f736f',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: simActiveSubTab === 'ACTIVITIES' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    📝 Interactive Activities ({adminActivities.length})
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <select
                    value={simFilterGrade}
                    onChange={(e) => setSimFilterGrade(e.target.value)}
                    style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px', background: '#ffffff', fontWeight: '600' }}
                  >
                    <option value="">All Grades (१ देखि १२)</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                      <option key={g} value={g}>Class {g}</option>
                    ))}
                  </select>

                  <select
                    value={simFilterSubject}
                    onChange={(e) => setSimFilterSubject(e.target.value)}
                    style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px', background: '#ffffff', fontWeight: '600' }}
                  >
                    <option value="">All Subjects</option>
                    <option value="SCI">Science & Technology (विज्ञान)</option>
                    <option value="MTH">Mathematics (गणित)</option>
                    <option value="COM">Computer Science (कम्प्युटर)</option>
                    <option value="ENG">English</option>
                    <option value="NEP">Nepali</option>
                  </select>
                </div>
              </div>

              {/* SIMULATIONS LIST */}
              {simActiveSubTab === 'SIMS' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                  {adminSimulations.map((sim) => (
                    <div
                      key={sim.id || sim._id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #dcebe6',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', background: '#daf5ec', color: '#0f5f55', padding: '3px 8px', borderRadius: '6px' }}>
                            {sim.simulationType}
                          </span>
                          <button
                            onClick={() => handleTogglePublishSim(sim.id || sim._id, sim.isPublished)}
                            style={{
                              padding: '3px 10px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: '700',
                              border: 'none',
                              cursor: 'pointer',
                              background: sim.isPublished ? '#dcfce7' : '#fee2e2',
                              color: sim.isPublished ? '#15803d' : '#b91c1c'
                            }}
                          >
                            {sim.isPublished ? '● Published' : '○ Draft'}
                          </button>
                        </div>

                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', marginBottom: '4px' }}>
                          {sim.title}
                        </h4>
                        {sim.titleNepali && (
                          <div style={{ fontSize: '13px', color: '#6d5bd0', fontWeight: '600', marginBottom: '8px' }}>
                            {sim.titleNepali}
                          </div>
                        )}

                        <p style={{ fontSize: '12px', color: '#5f736f', lineHeight: '1.5', flex: 1, marginBottom: '14px' }}>
                          {sim.description}
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                          <span style={{ fontSize: '11px', background: '#ebf5f1', color: '#4b605b', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                            Classes: {sim.gradeLevels?.join(', ')}
                          </span>
                          <span style={{ fontSize: '11px', background: '#ebf5f1', color: '#4b605b', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                            Subject: {sim.subjectCode || 'General'}
                          </span>
                          <span style={{ fontSize: '11px', background: '#ede9fe', color: '#3b2f8f', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                            🚀 {sim.smartBoardLaunches || 0} Board Launches
                          </span>
                        </div>

                        {sim.learningObjectives && sim.learningObjectives.length > 0 && (
                          <div style={{ fontSize: '11px', color: '#4b605b', background: '#f4faf8', padding: '8px 12px', borderRadius: '8px', marginBottom: '14px' }}>
                            <strong>Objectives:</strong> {sim.learningObjectives.slice(0, 2).join(' • ')}
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #ebf5f1', paddingTop: '14px' }}>
                          <button
                            onClick={() => setPreviewSim(sim)}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              background: '#f4faf8',
                              color: '#2f4f4c',
                              border: '1px solid #cfdcd8',
                              padding: '8px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            <Eye size={14} /> Preview
                          </button>

                          <button
                            onClick={() => window.open(`/smartboard/index.html?mode=split&sim=${encodeURIComponent(sim.runtimeUrl)}`, '_blank')}
                            style={{
                              flex: 1.2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              background: '#117a6b',
                              color: '#ffffff',
                              border: 'none',
                              padding: '8px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            🖥 Smart Board
                          </button>

                          <button
                            onClick={() => handleDeleteSim(sim.id || sim._id)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: '1px solid #fee2e2',
                              background: '#fef2f2',
                              color: '#dc2626',
                              cursor: 'pointer'
                            }}
                            title="Delete Simulation"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ACTIVITIES LIST */}
              {simActiveSubTab === 'ACTIVITIES' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                  {adminActivities.map((act) => (
                    <div
                      key={act.id || act._id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #dcebe6',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', background: '#ede9fe', color: '#3b2f8f', padding: '3px 8px', borderRadius: '6px' }}>
                          {act.type.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => handleTogglePublishAct(act.id || act._id, act.isPublished)}
                          style={{
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            border: 'none',
                            cursor: 'pointer',
                            background: act.isPublished ? '#dcfce7' : '#fee2e2',
                            color: act.isPublished ? '#15803d' : '#b91c1c'
                          }}
                        >
                          {act.isPublished ? '● Published' : '○ Draft'}
                        </button>
                      </div>

                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', marginBottom: '4px' }}>
                        {act.title}
                      </h4>
                      {act.titleNepali && (
                        <div style={{ fontSize: '13px', color: '#6d5bd0', fontWeight: '600', marginBottom: '8px' }}>
                          {act.titleNepali}
                        </div>
                      )}

                      <p style={{ fontSize: '12px', color: '#5f736f', lineHeight: '1.5', flex: 1, marginBottom: '14px' }}>
                        {act.description}
                      </p>

                      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', fontSize: '11px', fontWeight: '600', color: '#4b605b' }}>
                        <span style={{ background: '#ebf5f1', padding: '3px 8px', borderRadius: '4px' }}>
                          Classes: {act.gradeLevels?.join(', ')}
                        </span>
                        <span style={{ background: '#ebf5f1', padding: '3px 8px', borderRadius: '4px' }}>
                          Total Marks: {act.totalMarks}
                        </span>
                        <span style={{ background: '#e6f7f0', color: '#0f5f55', padding: '3px 8px', borderRadius: '4px' }}>
                          Pass: {act.passingScore}
                        </span>
                      </div>

                      <button
                        onClick={() => setPlayerActivity(act)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: '#4f46e5',
                          color: '#ffffff',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '700',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Sparkles size={14} /> Preview & Test Activity
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 7: SUBSCRIPTIONS, PACKAGES & LICENSING (PHASE 12)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'AI_INDEX' && <AIIndexStatusPanel />}
          {activeTab === 'SECURITY' && <SecurityPanel />}
          {activeTab === 'PLATFORM' && <PlatformOpsPanel />}

          {activeTab === 'SUBSCRIPTIONS' && (
            <div>
              {/* Top Licensing KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #dcebe6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f' }}>Active School Licenses</span>
                    <ShieldCheck size={18} color="#117a6b" />
                  </div>
                  <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: '#117a6b', margin: 0 }}>
                    {renewalDashboard?.activeCount ?? 0}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#16a34a', margin: '4px 0 0 0' }}>Nationwide Commercial Institutions</p>
                </div>

                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #dcebe6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f' }}>Upcoming Renewals</span>
                    <Clock size={18} color="#117a6b" />
                  </div>
                  <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: '#117a6b', margin: 0 }}>
                    {renewalDashboard?.upcomingRenewalsCount ?? 0}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#5f736f', margin: '4px 0 0 0' }}>Expiring within next 30 days</p>
                </div>

                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #dcebe6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f' }}>In Grace Period</span>
                    <AlertTriangle size={18} color="#6d5bd0" />
                  </div>
                  <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: '#6d5bd0', margin: 0 }}>
                    {renewalDashboard?.gracePeriodCount ?? 0}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#6d5bd0', margin: '4px 0 0 0' }}>15-Day Renewal Grace Window</p>
                </div>

                <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #dcebe6', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f' }}>Invoices Generated</span>
                    <DollarSign size={18} color="#7c3aed" />
                  </div>
                  <h3 style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: '#7c3aed', margin: 0 }}>
                    {invoices.length}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#5f736f', margin: '4px 0 0 0' }}>Khalti / eSewa / Bank Invoices</p>
                </div>
              </div>

              {/* Configurable Nepal Packages Grid */}
              <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #dcebe6', marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#0e3e3b' }}>
                      Configurable Nepal Subscription Packages
                    </h3>
                    <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
                      Super Admin pricing control across Foundation (Classes 1–5), Middle School (Classes 6–8), and Secondary (Classes 9–12).
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingPlan({
                        code: 'NEW_PACKAGE',
                        name: 'Custom Package',
                        tier: 'CUSTOM',
                        description: 'Custom Nepal curriculum package',
                        applicableGrades: [1, 2, 3, 4, 5],
                        pricing: { currency: 'NPR', annualPriceNpr: 50000, monthlyPriceNpr: 5000, perStudentPriceNpr: 50 },
                        isActive: true,
                      });
                      setIsEditPlanModalOpen(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: '#117a6b',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={14} /> Add Custom Plan
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                  {plans.map((p) => (
                    <div
                      key={p.id || p._id}
                      style={{
                        background: '#f4faf8',
                        border: '1px solid #dcebe6',
                        borderRadius: '10px',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: '800',
                              background:
                                p.tier === 'FOUNDATION'
                                  ? '#e6f7f0'
                                  : p.tier === 'MIDDLE_SCHOOL'
                                  ? '#ede9fe'
                                  : p.tier === 'SECONDARY'
                                  ? '#e6f7f0'
                                  : '#faf5ff',
                              color:
                                p.tier === 'FOUNDATION'
                                  ? '#117a6b'
                                  : p.tier === 'MIDDLE_SCHOOL'
                                  ? '#6d5bd0'
                                  : p.tier === 'SECONDARY'
                                  ? '#117a6b'
                                  : '#7c3aed',
                            }}
                          >
                            Classes {(p.applicableGrades || []).join(', ')}
                          </span>
                          <span style={{ fontSize: '11px', color: p.isActive ? '#16a34a' : '#8da19d', fontWeight: '700' }}>
                            {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 4px 0', color: '#0e3e3b' }}>{p.name}</h4>
                        <p style={{ fontSize: '11px', color: '#5f736f', margin: '0 0 12px 0', minHeight: '32px' }}>{p.description}</p>

                        <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dcebe6', marginBottom: '12px' }}>
                          <div style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b' }}>
                            NPR {(p.pricing?.annualPriceNpr || 0).toLocaleString('en-IN')} <span style={{ fontSize: '11px', fontWeight: '600', color: '#5f736f' }}>/ year</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#5f736f', marginTop: '2px' }}>
                            NPR {(p.pricing?.monthlyPriceNpr || Math.round((p.pricing?.annualPriceNpr || 0) / 10)).toLocaleString('en-IN')} / month
                          </div>
                        </div>

                        <div style={{ fontSize: '11px', color: '#4b605b', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                          <div>✓ CDC Official Textbooks</div>
                          <div>✓ Interactive Simulations & Activities</div>
                          <div>✓ IFP EduVerse Smart Board Launcher</div>
                          <div>✓ AI Student & Teacher Tutor</div>
                          <div>✓ Examination & Terminal Results</div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setEditingPlan({ ...p });
                          setIsEditPlanModalOpen(true);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: '#ffffff',
                          color: '#117a6b',
                          border: '1px solid #bfeede',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        Edit Pricing & Limits
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <BulkSubscriptionsPanel onChanged={loadSubscriptionData} />

              {/* Renewal Watchlist & Active Subscriptions */}
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', marginBottom: '28px', overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #ebf5f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#0e3e3b' }}>
                      Renewal Watchlist & Upcoming Expirations
                    </h3>
                    <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
                      Institutions in 15-day Grace Period or expiring in the next 30 days
                    </p>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6' }}>
                    <tr>
                      <th style={{ padding: '12px 20px', fontWeight: '700' }}>Institution Name</th>
                      <th style={{ padding: '12px 20px', fontWeight: '700' }}>EMIS Code</th>
                      <th style={{ padding: '12px 20px', fontWeight: '700' }}>Package</th>
                      <th style={{ padding: '12px 20px', fontWeight: '700' }}>Status</th>
                      <th style={{ padding: '12px 20px', fontWeight: '700' }}>End Date</th>
                      <th style={{ padding: '12px 20px', fontWeight: '700', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(renewalDashboard?.upcomingExpirations || []).concat(renewalDashboard?.inGracePeriod || []).length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#5f736f' }}>
                          No institutions currently expiring or in grace period. All active subscriptions in good standing.
                        </td>
                      </tr>
                    ) : (
                      (renewalDashboard?.upcomingExpirations || []).concat(renewalDashboard?.inGracePeriod || []).map((sub: any) => (
                        <tr key={sub.id || sub._id} style={{ borderBottom: '1px solid #ebf5f1' }}>
                          <td style={{ padding: '12px 20px', fontWeight: '700', color: '#0e3e3b' }}>{sub.institutionId?.name}</td>
                          <td style={{ padding: '12px 20px', color: '#5f736f' }}>{sub.institutionId?.emisCode}</td>
                          <td style={{ padding: '12px 20px', fontWeight: '600' }}>{sub.planId?.name || sub.planCode}</td>
                          <td style={{ padding: '12px 20px' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '700',
                                background: sub.status === 'ACTIVE' ? '#e6f7f0' : '#ede9fe',
                                color: sub.status === 'ACTIVE' ? '#117a6b' : '#6d5bd0',
                              }}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 20px', color: '#4b605b' }}>
                            {new Date(sub.endDate).toISOString().split('T')[0]}
                          </td>
                          <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button
                                onClick={() => handleExtendSubscription(sub.id || sub._id)}
                                style={{ padding: '5px 10px', background: '#117a6b', color: '#ffffff', borderRadius: '6px', fontSize: '11px', fontWeight: '700', border: 'none', cursor: 'pointer' }}
                              >
                                + Extend
                              </button>
                              <button
                                onClick={() => handleToggleSuspend(sub.id || sub._id, sub.status)}
                                style={{ padding: '5px 10px', background: '#f4faf8', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                              >
                                {sub.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Invoices Ledger Table */}
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #ebf5f1' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#0e3e3b' }}>
                    Invoices & Payment Transactions Ledger
                  </h3>
                  <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>
                    Commercial billings and receipts across Khalti, eSewa, and verified bank deposits
                  </p>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6' }}>
                    <tr>
                      <th style={{ padding: '12px 20px', fontWeight: '700' }}>Invoice #</th>
                      <th style={{ padding: '12px 20px', fontWeight: '700' }}>Institution</th>
                      <th style={{ padding: '12px 20px', fontWeight: '700' }}>Amount (NPR)</th>
                      <th style={{ padding: '12px 20px', fontWeight: '700' }}>Status</th>
                      <th style={{ padding: '12px 20px', fontWeight: '700' }}>Issue Date</th>
                      <th style={{ padding: '12px 20px', fontWeight: '700' }}>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#5f736f' }}>
                          No invoices generated yet.
                        </td>
                      </tr>
                    ) : (
                      invoices.map((inv: any) => (
                        <tr key={inv.id || inv._id} style={{ borderBottom: '1px solid #ebf5f1' }}>
                          <td style={{ padding: '12px 20px', fontWeight: '700', color: '#117a6b' }}>{inv.invoiceNumber}</td>
                          <td style={{ padding: '12px 20px', fontWeight: '600' }}>{inv.institutionId?.name || 'Institution'}</td>
                          <td style={{ padding: '12px 20px', fontWeight: '800' }}>NPR {Number(inv.totalAmountNpr || 0).toLocaleString('en-IN')}</td>
                          <td style={{ padding: '12px 20px' }}>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '700',
                                background: inv.status === 'PAID' ? '#e6f7f0' : inv.status === 'OVERDUE' ? '#fef2f2' : '#e6f7f0',
                                color: inv.status === 'PAID' ? '#117a6b' : inv.status === 'OVERDUE' ? '#dc2626' : '#117a6b',
                              }}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 20px', color: '#5f736f' }}>
                            {new Date(inv.issueDate).toISOString().split('T')[0]}
                          </td>
                          <td style={{ padding: '12px 20px', color: '#5f736f' }}>
                            {new Date(inv.dueDate).toISOString().split('T')[0]}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL: CHAPTERS & TOPICS EDITOR ─────────────────────── */}
      {selectedTbForChapters && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '780px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Curriculum Structure & Table of Contents</h3>
                <div style={{ fontSize: '12px', color: '#5f736f' }}>{selectedTbForChapters.title}</div>
              </div>
              <button
                onClick={() => setSelectedTbForChapters(null)}
                style={{ padding: '4px 8px', borderRadius: '6px', background: '#ebf5f1', fontWeight: '700', fontSize: '13px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
              {/* Existing Chapters */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: '#2f4f4c' }}>
                  Extracted Chapters ({chaptersList.length})
                </h4>

                {chaptersList.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#5f736f', padding: '16px', background: '#f4faf8', borderRadius: '8px' }}>
                    No chapters extracted yet. Add chapters below or check processing status.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {chaptersList.map((ch) => (
                      <div key={ch.id || ch._id} style={{ border: '1px solid #dcebe6', borderRadius: '8px', padding: '12px', background: '#f4faf8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '700', fontSize: '13px' }}>
                            Chapter {ch.chapterNumber}: {ch.title}
                          </span>
                          <span style={{ fontSize: '11px', fontFamily: 'monospace', background: '#dcebe6', padding: '2px 6px', borderRadius: '4px' }}>
                            pp. {ch.startPage}–{ch.endPage}
                          </span>
                        </div>
                        {ch.titleNepali && <div style={{ fontSize: '11px', color: '#5f736f' }}>{ch.titleNepali}</div>}

                        {/* Topics */}
                        {(ch.topics || []).length > 0 && (
                          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #cfdcd8' }}>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#4b605b', marginBottom: '4px' }}>Topics & Learning Objectives:</div>
                            {ch.topics.map((t: any, idx: number) => (
                              <div key={idx} style={{ fontSize: '11px', color: '#5f736f', display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                                <span>• {t.title}</span>
                                {t.startPage && <span>p.{t.startPage}</span>}
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setSelectedChapterForTopic(ch.id || ch._id)}
                            style={{ fontSize: '11px', color: '#117a6b', fontWeight: '600', background: 'transparent' }}
                          >
                            + Add Topic
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Chapter Form */}
              <div style={{ borderTop: '1px solid #dcebe6', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>Add Chapter Manually</h4>
                <form onSubmit={handleAddChapter} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 100px auto', gap: '8px', alignItems: 'end' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>No.</label>
                    <input
                      type="number"
                      required
                      value={newChapterForm.chapterNumber}
                      onChange={(e) => setNewChapterForm({ ...newChapterForm, chapterNumber: parseInt(e.target.value) || 1 })}
                      style={{ width: '100%', padding: '6px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Chapter Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Force and Motion"
                      value={newChapterForm.title}
                      onChange={(e) => setNewChapterForm({ ...newChapterForm, title: e.target.value })}
                      style={{ width: '100%', padding: '6px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Start Page</label>
                    <input
                      type="number"
                      required
                      value={newChapterForm.startPage}
                      onChange={(e) => setNewChapterForm({ ...newChapterForm, startPage: parseInt(e.target.value) || 1 })}
                      style={{ width: '100%', padding: '6px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>End Page</label>
                    <input
                      type="number"
                      required
                      value={newChapterForm.endPage}
                      onChange={(e) => setNewChapterForm({ ...newChapterForm, endPage: parseInt(e.target.value) || 1 })}
                      style={{ width: '100%', padding: '6px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '12px' }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{ padding: '6px 14px', background: '#117a6b', color: '#ffffff', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}
                  >
                    Add Chapter
                  </button>
                </form>
              </div>

              {/* Add Topic Sub-form */}
              {selectedChapterForTopic && (
                <div style={{ marginTop: '16px', background: '#e6f7f0', padding: '16px', borderRadius: '8px', border: '1px solid #bfeede' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f5f55' }}>Add Topic to Selected Chapter</span>
                    <button onClick={() => setSelectedChapterForTopic('')} style={{ fontSize: '11px', color: '#5f736f' }}>Cancel</button>
                  </div>
                  <form onSubmit={handleAddTopic}>
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px', gap: '8px', marginBottom: '8px' }}>
                      <input
                        type="number"
                        placeholder="No."
                        value={newTopicForm.topicNumber}
                        onChange={(e) => setNewTopicForm({ ...newTopicForm, topicNumber: parseInt(e.target.value) || 1 })}
                        style={{ padding: '6px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '12px' }}
                      />
                      <input
                        type="text"
                        required
                        placeholder="Topic Title"
                        value={newTopicForm.title}
                        onChange={(e) => setNewTopicForm({ ...newTopicForm, title: e.target.value })}
                        style={{ padding: '6px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '12px' }}
                      />
                      <input
                        type="number"
                        placeholder="Start Page"
                        value={newTopicForm.startPage}
                        onChange={(e) => setNewTopicForm({ ...newTopicForm, startPage: parseInt(e.target.value) || 1 })}
                        style={{ padding: '6px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Learning objectives (one per line)..."
                      value={newTopicForm.learningObjectives}
                      onChange={(e) => setNewTopicForm({ ...newTopicForm, learningObjectives: e.target.value })}
                      style={{ width: '100%', padding: '6px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '12px', marginBottom: '8px' }}
                    />
                    <button
                      type="submit"
                      style={{ padding: '6px 12px', background: '#0f5f55', color: '#ffffff', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}
                    >
                      Save Topic
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: UPLOAD NEW TEXTBOOK PDF ──────────────────────── */}
      {isUploadModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div style={{ background: '#ffffff', padding: '28px', borderRadius: '16px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px' }}>Upload CDC Textbook PDF</h3>
            <p style={{ fontSize: '12px', color: '#5f736f', marginBottom: '20px' }}>
              SHA-256 duplicate validation and automated chapter/topic regex extraction will run upon upload.
            </p>

            <form onSubmit={handleUploadTextbook}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Select PDF File</label>
                <input
                  type="file"
                  required
                  accept="application/pdf"
                  onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  style={{ width: '100%', padding: '8px', border: '1px dashed #cfdcd8', borderRadius: '8px', fontSize: '12px' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Textbook Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Compulsory Mathematics - Grade 10"
                  value={uploadFormData.title}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Grade (1–12)</label>
                  <select
                    value={uploadFormData.gradeNumber}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, gradeNumber: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px', background: '#ffffff' }}
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={String(i + 1)}>Class {i + 1}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Instruction Medium</label>
                  <select
                    value={uploadFormData.medium}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, medium: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px', background: '#ffffff' }}
                  >
                    <option value="NEPALI">Nepali Medium</option>
                    <option value="ENGLISH">English Medium</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Subject Mapping</label>
                <select
                  value={uploadFormData.subjectId}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, subjectId: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px', background: '#ffffff' }}
                >
                  {subjects.map((sub) => (
                    <option key={sub.id || sub._id} value={sub.id || sub._id}>
                      {sub.name} (Grade {sub.gradeNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Edition</label>
                  <input
                    type="text"
                    value={uploadFormData.edition}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, edition: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Publication Year (BS)</label>
                  <input
                    type="number"
                    value={uploadFormData.publicationYear}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, publicationYear: parseInt(e.target.value) || 2081 })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#ebf5f1', borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#117a6b', color: '#ffffff', borderRadius: '6px', fontWeight: '700', fontSize: '13px' }}
                >
                  Upload & Process
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD SCHOOL ───────────────────────────────────── */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '16px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Register New School / College</h3>
            <form onSubmit={handleCreateInstitution}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>EMIS Code</label>
                <input
                  type="text"
                  required
                  value={newInst.emisCode}
                  onChange={(e) => setNewInst({ ...newInst, emisCode: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>School Name (English)</label>
                <input
                  type="text"
                  required
                  value={newInst.name}
                  onChange={(e) => setNewInst({ ...newInst, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>School Name (Nepali)</label>
                <input
                  type="text"
                  value={newInst.nameNepali}
                  onChange={(e) => setNewInst({ ...newInst, nameNepali: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Province</label>
                  <input
                    type="text"
                    required
                    value={newInst.province}
                    onChange={(e) => setNewInst({ ...newInst, province: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>District</label>
                  <input
                    type="text"
                    required
                    value={newInst.district}
                    onChange={(e) => setNewInst({ ...newInst, district: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Admin Username</label>
                <input
                  type="text"
                  required
                  value={newInst.adminUsername}
                  onChange={(e) => setNewInst({ ...newInst, adminUsername: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Admin Initial Password</label>
                <input
                  type="password"
                  required
                  value={newInst.adminPassword}
                  onChange={(e) => setNewInst({ ...newInst, adminPassword: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#ebf5f1', borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#117a6b', color: '#ffffff', borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}
                >
                  Save & Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RESPONSIVE PDF READER MODAL ─────────────────────────── */}
      <PdfReaderModal
        isOpen={!!activeReaderTextbook}
        onClose={() => setActiveReaderTextbook(null)}
        textbook={activeReaderTextbook}
      />

      {/* ── SIMULATION VIEWER MODAL (PHASE 7) ────────────────────── */}
      <SimulationViewerModal
        simulation={previewSim}
        onClose={() => setPreviewSim(null)}
        onLaunchSmartBoard={(s) => {
          window.open(`/smartboard/index.html?mode=split&sim=${encodeURIComponent(s.runtimeUrl)}`, '_blank');
        }}
      />

      {/* ── INTERACTIVE ACTIVITY PLAYER MODAL (PHASE 7) ─────────── */}
      {playerActivity && (
        <InteractiveActivityPlayer
          activity={playerActivity}
          onClose={() => setPlayerActivity(null)}
        />
      )}

      {/* ── MODAL: REGISTER NEW SIMULATION (PHASE 7) ────────────── */}
      {isAddSimModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>Register New Curriculum Simulation</h3>
            <p style={{ fontSize: '12px', color: '#5f736f', marginBottom: '20px' }}>
              Add a 2D Canvas, 3D WebGL, or HTML5 interactive simulation to the central library.
            </p>

            <form onSubmit={handleCreateSimulation}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Simulation Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SIM-PHY-G10-OPTICS"
                    value={newSimForm.code}
                    onChange={(e) => setNewSimForm({ ...newSimForm, code: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Type</label>
                  <select
                    value={newSimForm.simulationType}
                    onChange={(e) => setNewSimForm({ ...newSimForm, simulationType: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px' }}
                  >
                    <option value="2D_CANVAS">2D Canvas / Interactive</option>
                    <option value="3D_WEBGL">3D WebGL / Three.js</option>
                    <option value="HTML5_SIM">HTML5 Virtual Lab</option>
                    <option value="REACT_INTERACTIVE">React Interactive</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Simulation Title (English)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ray Optics & Lens Refraction"
                  value={newSimForm.title}
                  onChange={(e) => setNewSimForm({ ...newSimForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Title (Nepali - Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. प्रकाशको आवर्तन र लेन्स"
                  value={newSimForm.titleNepali}
                  onChange={(e) => setNewSimForm({ ...newSimForm, titleNepali: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Runtime URL / File Path</label>
                <input
                  type="text"
                  required
                  placeholder="/simulations/physics-electric-circuit.html"
                  value={newSimForm.runtimeUrl}
                  onChange={(e) => setNewSimForm({ ...newSimForm, runtimeUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Grade Levels (Comma separated)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8, 9, 10"
                    value={newSimForm.gradeLevels}
                    onChange={(e) => setNewSimForm({ ...newSimForm, gradeLevels: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Subject Code</label>
                  <select
                    value={newSimForm.subjectCode}
                    onChange={(e) => setNewSimForm({ ...newSimForm, subjectCode: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px' }}
                  >
                    <option value="SCI">Science & Tech (SCI)</option>
                    <option value="MTH">Mathematics (MTH)</option>
                    <option value="COM">Computer Science (COM)</option>
                    <option value="ENG">English (ENG)</option>
                    <option value="NEP">Nepali (NEP)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Overview of the virtual experiment..."
                  value={newSimForm.description}
                  onChange={(e) => setNewSimForm({ ...newSimForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Learning Objectives (One per line)</label>
                <textarea
                  rows={2}
                  placeholder="Calculate refractive index&#10;Verify Snell's law"
                  value={newSimForm.learningObjectives}
                  onChange={(e) => setNewSimForm({ ...newSimForm, learningObjectives: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddSimModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#ebf5f1', borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#117a6b', color: '#ffffff', borderRadius: '6px', fontWeight: '600', fontSize: '13px' }}
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ASSIGN SUBSCRIPTION (PHASE 12) ─────────────────── */}
      {isAssignModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Assign Subscription to Institution</h3>
                <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>Grants curriculum access and generates commercial invoice</p>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} style={{ background: '#ebf5f1', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <form onSubmit={handleAssignSubscription}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Select Institution</label>
                <select
                  required
                  value={assignForm.institutionId}
                  onChange={(e) => setAssignForm({ ...assignForm, institutionId: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                >
                  <option value="">Choose Institution...</option>
                  {institutionOptions.map((inst) => (
                    <option key={inst.id || inst._id} value={inst.id || inst._id}>
                      {inst.name} ({inst.emisCode} · {inst.district})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Select Subscription Package</label>
                <select
                  required
                  value={assignForm.planId}
                  onChange={(e) => setAssignForm({ ...assignForm, planId: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                >
                  <option value="">Choose Package...</option>
                  {plans.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.name} (Classes {(p.applicableGrades || []).join(', ')} · NPR {Number(p.pricing?.annualPriceNpr || 0).toLocaleString('en-IN')}/yr)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Duration</label>
                  <select
                    value={assignForm.durationMonths}
                    onChange={(e) => setAssignForm({ ...assignForm, durationMonths: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                  >
                    <option value={12}>1 Year (12 Months)</option>
                    <option value={24}>2 Years (24 Months)</option>
                    <option value={36}>3 Years (36 Months)</option>
                    <option value={6}>6 Months (Half Year)</option>
                    <option value={1}>1 Month (Trial)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Billing Cycle</label>
                  <select
                    value={assignForm.billingCycle}
                    onChange={(e: any) => setAssignForm({ ...assignForm, billingCycle: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                  >
                    <option value="ANNUAL">Annual Billing</option>
                    <option value="MONTHLY">Monthly Billing</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Notes & Sanction Reference</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Government grant allocation or direct commercial subscription."
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#ebf5f1', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', background: '#117a6b', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  Assign & Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT PLAN PRICING & SETTINGS (PHASE 12) ─────────── */}
      {isEditPlanModalOpen && editingPlan && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Configure Package & Pricing</h3>
                <p style={{ fontSize: '12px', color: '#5f736f', margin: '2px 0 0 0' }}>Plan Code: {editingPlan.code}</p>
              </div>
              <button onClick={() => setIsEditPlanModalOpen(false)} style={{ background: '#ebf5f1', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            </div>

            <form onSubmit={handleUpdatePlan}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Package Name</label>
                <input
                  type="text"
                  required
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Annual Price (NPR)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingPlan.pricing?.annualPriceNpr || 0}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        pricing: { ...(editingPlan.pricing || {}), annualPriceNpr: Number(e.target.value) },
                      })
                    }
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Monthly Price (NPR)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingPlan.pricing?.monthlyPriceNpr || 0}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        pricing: { ...(editingPlan.pricing || {}), monthlyPriceNpr: Number(e.target.value) },
                      })
                    }
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Description</label>
                <textarea
                  rows={2}
                  value={editingPlan.description || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditPlanModalOpen(false)}
                  style={{ padding: '8px 16px', background: '#ebf5f1', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', background: '#117a6b', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  Save Pricing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 12-Step Automated Provisioning Wizard Modal */}
      <SuperAdminProvisioningWizardModal
        isOpen={isProvisioningWizardOpen}
        onClose={() => setIsProvisioningWizardOpen(false)}
        onSuccess={() => {
          loadDashboardData();
          setIsProvisioningWizardOpen(false);
        }}
      />

      {/* Institution Dossier, Subscription Review & Leadership Modal */}
      <InstitutionManagementModal
        isOpen={isManageModalOpen}
        onClose={() => {
          setIsManageModalOpen(false);
          setSelectedInstForManage(null);
        }}
        institutionId={selectedInstForManage}
        onUpdated={() => loadDashboardData()}
      />
    </div>
  );
};
