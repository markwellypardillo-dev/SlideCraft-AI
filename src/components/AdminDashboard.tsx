import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  Activity,
  Users,
  Cpu,
  Layers,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Zap,
  TrendingUp,
  Database,
  Sliders,
  Globe,
  HardDrive,
  Eye,
  Check,
  ArrowUpRight,
  UserCheck,
  UserX,
  Radio,
  BarChart2,
  PieChart,
  Layout,
  BookOpen,
  Send,
  Lock,
  ExternalLink,
  LayoutTemplate,
  Presentation,
  Plus,
  Copy,
  Edit3,
} from 'lucide-react';
import {
  AdminSubTab,
  SystemLogEntry,
  LogLevel,
  LogCategory,
  UserAccountSummary,
  APIEndpointMetric,
  SystemServiceHealth,
} from '../types/admin';
import {
  fetchRealSystemLogs,
  subscribeToRealLogs,
  clearSystemLogs,
  computeRealAdminKPIs,
  computeRealAPIEndpointMetrics,
  fetchRealUserDirectory,
  updateRealUserRole,
  updateRealUserStatus,
  deleteRealDeckAsAdmin,
  runRealSystemHealthChecks,
  recordSystemLog,
  ADMIN_PRIMARY_EMAIL,
} from '../services/adminService';
import { fetchAllPlatformDecksFromFirestore, auth } from '../services/firebase';
import { SlideDeck } from '../types/deck';
import { PresentationTemplate } from '../types/template';
import {
  fetchAdminTemplatesFromFirestore,
  saveAdminTemplateToFirestore,
  deleteAdminTemplateFromFirestore,
  createBlankMasterTemplate,
} from '../services/templateService';
import { TemplateArchitectStudio } from './admin/TemplateArchitectStudio';

interface AdminDashboardProps {
  isDark: boolean;
  onSwitchToStudio: () => void;
  savedDecks?: SlideDeck[];
  onOpenDeckInStudio?: (deck: SlideDeck) => void;
  initialSubTab?: AdminSubTab;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isDark,
  onSwitchToStudio,
  savedDecks = [],
  onOpenDeckInStudio,
  initialSubTab = 'overview',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>(initialSubTab);
  const [logs, setLogs] = useState<SystemLogEntry[]>([]);
  const [users, setUsers] = useState<UserAccountSummary[]>([]);
  const [platformDecks, setPlatformDecks] = useState<SlideDeck[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemServiceHealth[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isHealthChecking, setIsHealthChecking] = useState<boolean>(false);
  const [selectedLog, setSelectedLog] = useState<SystemLogEntry | null>(null);

  // Filters for logs
  const [logSearch, setLogSearch] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Filters for users
  const [userSearch, setUserSearch] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');

  // Filters for decks
  const [deckSearch, setDeckSearch] = useState<string>('');

  // Master Slide Templates State
  const [templates, setTemplates] = useState<PresentationTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<PresentationTemplate | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('ALL');
  const [templateSearch, setTemplateSearch] = useState<string>('');
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);

  // Selected Deck for Admin Modal Inspector
  const [inspectingDeck, setInspectingDeck] = useState<SlideDeck | null>(null);
  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null);

  // System Settings State
  const [aiModel, setAiModel] = useState<'gemini-2.5-flash' | 'gemini-1.5-pro'>('gemini-2.5-flash');
  const [maxSlideLimit, setMaxSlideLimit] = useState<number>(15);
  const [promptCacheEnabled, setPromptCacheEnabled] = useState<boolean>(true);
  const [maintenanceNotice, setMaintenanceNotice] = useState<boolean>(false);
  const [adminToast, setAdminToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setAdminToast(msg);
    setTimeout(() => setAdminToast(null), 3500);
  };

  // Load 100% Real Data from Firestore & API services
  const loadRealDashboardData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      // 1. Fetch Real Decks from Firestore
      let realDecks: SlideDeck[] = [];
      try {
        realDecks = await fetchAllPlatformDecksFromFirestore();
      } catch (e) {
        console.warn('Decks query fallback:', e);
      }
      // Merge with any current local savedDecks if not yet in DB
      if (savedDecks.length > 0) {
        const existingIds = new Set(realDecks.map((d) => d.id));
        savedDecks.forEach((sd) => {
          if (sd.id && !existingIds.has(sd.id)) {
            realDecks.push(sd);
          }
        });
      }
      setPlatformDecks(realDecks);

      // 2. Fetch Real Users from Firestore
      const realUsers = await fetchRealUserDirectory(realDecks);
      setUsers(realUsers);

      // 3. Fetch Real System Logs from Firestore
      const realLogs = await fetchRealSystemLogs();
      setLogs(realLogs);

      // 4. Fetch Real Master Templates from Firestore
      try {
        const realTemplates = await fetchAdminTemplatesFromFirestore();
        setTemplates(realTemplates);
      } catch (e) {
        console.warn('Templates query fallback:', e);
      }

      // 5. Run Real Live Health Checks
      const health = await runRealSystemHealthChecks();
      setSystemHealth(health);
    } catch (error) {
      console.error('Error loading real dashboard telemetry:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [savedDecks]);

  // Initial load and setup real-time log subscription
  useEffect(() => {
    loadRealDashboardData();

    // Subscribe to live logs via Firestore onSnapshot
    const unsubscribe = subscribeToRealLogs((updatedLogs) => {
      setLogs(updatedLogs);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loadRealDashboardData]);

  // Trigger manual live health diagnosis
  const handleRunHealthCheck = async () => {
    setIsHealthChecking(true);
    try {
      const results = await runRealSystemHealthChecks();
      setSystemHealth(results);
      showToast('Live diagnostics complete: All endpoints tested.');
      recordSystemLog({
        level: 'INFO',
        category: 'SYSTEM',
        action: 'HEALTH_CHECK_RUN',
        details: 'Admin ran live diagnostic health probe on all platform services.',
      });
    } catch {
      showToast('Diagnostic probe completed with warnings.');
    } finally {
      setIsHealthChecking(false);
    }
  };

  // 100% Real Computed KPIs
  const kpis = useMemo(() => {
    return computeRealAdminKPIs(platformDecks, users, logs);
  }, [platformDecks, users, logs]);

  // 100% Real Computed API Endpoint Metrics
  const apiMetrics: APIEndpointMetric[] = useMemo(() => {
    return computeRealAPIEndpointMetrics(logs);
  }, [logs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        !logSearch ||
        log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.details.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.category.toLowerCase().includes(logSearch.toLowerCase());

      const matchLevel = selectedLevel === 'ALL' || log.level === selectedLevel;
      const matchCategory = selectedCategory === 'ALL' || log.category === selectedCategory;

      return matchSearch && matchLevel && matchCategory;
    });
  }, [logs, logSearch, selectedLevel, selectedCategory]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !userSearch ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.displayName.toLowerCase().includes(userSearch.toLowerCase());
      const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
      return matchSearch && matchRole;
    });
  }, [users, userSearch, userRoleFilter]);

  // Filtered Presentations
  const filteredDecks = useMemo(() => {
    return platformDecks.filter((d) => {
      if (!deckSearch) return true;
      return (
        d.title.toLowerCase().includes(deckSearch.toLowerCase()) ||
        d.subject.toLowerCase().includes(deckSearch.toLowerCase()) ||
        d.targetAudience.toLowerCase().includes(deckSearch.toLowerCase())
      );
    });
  }, [platformDecks, deckSearch]);

  // User Role Mutation (Real Firestore persistence)
  const handleRoleChange = async (userId: string, currentRole: string, userName: string) => {
    const newRole = currentRole === 'educator' ? 'pro_scholar' : 'educator';
    try {
      await updateRealUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      showToast(`Updated permissions for ${userName} to ${newRole}`);
    } catch (err) {
      showToast('Failed to update role in Firestore.');
    }
  };

  // User Status Mutation (Real Firestore persistence)
  const handleStatusToggle = async (userId: string, currentStatus: string, userName: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await updateRealUserStatus(userId, newStatus);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
      showToast(`Account status for ${userName} set to ${newStatus.toUpperCase()}`);
    } catch (err) {
      showToast('Failed to update account status in Firestore.');
    }
  };

  // Admin Deck Deletion (Real Firestore persistence)
  const handleDeleteDeck = async (deck: SlideDeck) => {
    if (!deck.id) return;
    try {
      await deleteRealDeckAsAdmin(deck.id, deck.title);
      setPlatformDecks((prev) => prev.filter((d) => d.id !== deck.id));
      setDeletingDeckId(null);
      if (inspectingDeck?.id === deck.id) setInspectingDeck(null);
      showToast(`Deleted "${deck.title}" from cloud database.`);
    } catch (err) {
      showToast('Failed to delete deck from Firestore.');
    }
  };

  // Export logs to JSON
  const handleExportLogsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `slidecraft_real_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported real audit logs to JSON.');
  };

  // Export logs to CSV
  const handleExportLogsCSV = () => {
    const headers = ['Timestamp', 'Level', 'Category', 'Action', 'UserEmail', 'Details', 'LatencyMs', 'Status'];
    const rows = logs.map((l) => [
      l.timestamp,
      l.level,
      l.category,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.userEmail}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      l.metadata?.latencyMs || '',
      l.metadata?.status || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodedUri);
    downloadAnchor.setAttribute('download', `slidecraft_real_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported real audit logs to CSV.');
  };

  const handleClearLogs = () => {
    clearSystemLogs();
    setLogs([]);
    showToast('Local audit log view cleared.');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {adminToast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-2.5 rounded-2xl shadow-soft-xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-3 duration-200 ${
          isDark ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'
        }`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>{adminToast}</span>
        </div>
      )}

      {/* TOP HEADER: Admin Command Center Banner & Mode Switcher */}
      <div className={`p-6 rounded-3xl transition-all shadow-soft-md ${
        isDark
          ? 'bg-gradient-to-r from-purple-950/40 via-zinc-900 to-indigo-950/30 text-white'
          : 'bg-gradient-to-r from-purple-50 via-white to-indigo-50 text-zinc-900'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-400 flex items-center gap-1.5 shadow-soft-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                Root Administrator Console
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold px-2.5 py-0.5 rounded-xl bg-emerald-500/10 shadow-soft-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Firestore Telemetry
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-xl font-mono ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'}`}>
                {ADMIN_PRIMARY_EMAIL}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Platform Intelligence & Operations Hub
            </h1>
            <p className={`text-xs sm:text-sm max-w-2xl ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Real-time database metrics, actual Gemini API token consumption, verified presentation records, live audit logs, and account management.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleRunHealthCheck}
              disabled={isHealthChecking}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-soft-xs ${
                isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-white hover:bg-zinc-100 text-zinc-800'
              }`}
              title="Ping live endpoints"
            >
              <Activity className={`w-3.5 h-3.5 text-emerald-400 ${isHealthChecking ? 'animate-spin' : ''}`} />
              <span>{isHealthChecking ? 'Pinging Services...' : 'Ping Live Services'}</span>
            </button>

            <button
              onClick={loadRealDashboardData}
              disabled={isLoadingData}
              className={`p-2 rounded-2xl text-xs transition-all cursor-pointer shadow-soft-xs ${
                isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-white hover:bg-zinc-100 text-zinc-800'
              }`}
              title="Sync Real Firestore Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-purple-400' : ''}`} />
            </button>

            <button
              onClick={onSwitchToStudio}
              className="px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Switch to Studio Workspace</span>
            </button>
          </div>
        </div>

        {/* SUB-NAVIGATION TABS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-6 scrollbar-none">
          {[
            { id: 'overview' as AdminSubTab, label: 'Overview & KPIs', icon: Activity },
            { id: 'template_architect' as AdminSubTab, label: `Master Templates (${templates.length})`, icon: LayoutTemplate },
            { id: 'logs' as AdminSubTab, label: `Real Audit Logs (${logs.length})`, icon: FileText },
            { id: 'api_usage' as AdminSubTab, label: 'Gemini API & Tokens', icon: Cpu },
            { id: 'deck_analytics' as AdminSubTab, label: `Platform Decks (${platformDecks.length})`, icon: Layers },
            { id: 'user_management' as AdminSubTab, label: `Educator Directory (${users.length})`, icon: Users },
            { id: 'system_health' as AdminSubTab, label: 'Live System Health', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'bg-white text-zinc-950 shadow-soft-sm'
                      : 'bg-zinc-900 text-white shadow-soft-sm'
                    : isDark
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: REAL OVERVIEW & PLATFORM KPIS */}
      {/* ========================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Primary Top Real KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Active Users */}
            <div className={`p-5 rounded-3xl shadow-soft-sm transition-all ${isDark ? 'bg-zinc-900/90 text-white' : 'bg-white text-zinc-900'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400">Active Educators</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">{kpis.activeUsersCount}</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-ping" />
                  Live Now
                </span>
              </div>
              <div className="mt-2 text-[11px] text-zinc-400 flex justify-between">
                <span>Today's Active: <strong>{kpis.dailyActiveUsers}</strong></span>
                <span>Role: <strong>Admin Active</strong></span>
              </div>
            </div>

            {/* Card 2: Total Real Presentations in Firestore */}
            <div className={`p-5 rounded-3xl shadow-soft-sm transition-all ${isDark ? 'bg-zinc-900/90 text-white' : 'bg-white text-zinc-900'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400">Real Presentations in DB</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">{kpis.totalDecksCreated}</span>
                <span className="text-xs font-bold text-indigo-400">decks in Firestore</span>
              </div>
              <div className="mt-2 text-[11px] text-zinc-400 flex justify-between">
                <span>Total Slides: <strong>{kpis.totalSlidesGenerated}</strong></span>
                <span>Avg: <strong>{kpis.totalDecksCreated > 0 ? (kpis.totalSlidesGenerated / kpis.totalDecksCreated).toFixed(1) : '0'} slides/deck</strong></span>
              </div>
            </div>

            {/* Card 3: Real Gemini API Token Consumption */}
            <div className={`p-5 rounded-3xl shadow-soft-sm transition-all ${isDark ? 'bg-zinc-900/90 text-white' : 'bg-white text-zinc-900'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400">Real Gemini Token Flow</span>
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {kpis.totalTokensProcessed > 1000 ? `${(kpis.totalTokensProcessed / 1000).toFixed(1)}k` : kpis.totalTokensProcessed}
                </span>
                <span className="text-xs font-bold text-purple-400">tokens tracked</span>
              </div>
              <div className="mt-2 text-[11px] text-zinc-400 flex justify-between">
                <span>API Calls: <strong>{kpis.totalAPICalls}</strong></span>
                <span>Avg Latency: <strong>{kpis.avgLatencyMs}ms</strong></span>
              </div>
            </div>

            {/* Card 4: Registered Users in Firestore */}
            <div className={`p-5 rounded-3xl shadow-soft-sm transition-all ${isDark ? 'bg-zinc-900/90 text-white' : 'bg-white text-zinc-900'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400">Registered Users in DB</span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">{kpis.totalRegisteredUsers}</span>
                <span className="text-xs font-bold text-blue-400">accounts</span>
              </div>
              <div className="mt-2 text-[11px] text-zinc-400 flex justify-between">
                <span>Service Uptime: <strong>{kpis.uptimePercentage}%</strong></span>
                <span>Error Rate: <strong>{kpis.errorRatePercentage}%</strong></span>
              </div>
            </div>
          </div>

          {/* Middle Section: Real-time Telemetry Stream & API Performance Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Live Activity Feed from Firestore */}
            <div className={`lg:col-span-2 p-6 rounded-3xl shadow-soft-sm space-y-4 ${isDark ? 'bg-zinc-900/90 text-white' : 'bg-white text-zinc-900'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <h3 className="font-extrabold text-sm">Real-time Platform Audit Log</h3>
                </div>
                <button
                  onClick={() => setActiveSubTab('logs')}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All {logs.length} Logs</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto scrollbar-none">
                {logs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-400">
                    No logs recorded yet. Real operations (AI generation, sign-ins, exports) will appear here live.
                  </div>
                ) : (
                  logs.slice(0, 7).map((log) => (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`p-3.5 rounded-2xl transition-all cursor-pointer shadow-soft-xs hover:shadow-soft-sm flex items-start justify-between gap-3 ${
                        isDark ? 'bg-zinc-950/60 hover:bg-zinc-800/80' : 'bg-zinc-50 hover:bg-zinc-100'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase shrink-0 mt-0.5 ${
                          log.level === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : log.level === 'ERROR'
                            ? 'bg-red-500/20 text-red-400'
                            : log.level === 'WARN'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-indigo-500/20 text-indigo-400'
                        }`}>
                          {log.level}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold truncate">{log.action}</span>
                            <span className="text-[10px] text-zinc-400 truncate">{log.userEmail}</span>
                          </div>
                          <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                            {log.details}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-500 whitespace-nowrap shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Col: Live Service Health */}
            <div className={`p-6 rounded-3xl shadow-soft-sm space-y-4 ${isDark ? 'bg-zinc-900/90 text-white' : 'bg-white text-zinc-900'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-extrabold text-sm">Live Service Health</h3>
                </div>
                <button
                  onClick={handleRunHealthCheck}
                  disabled={isHealthChecking}
                  className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full hover:bg-emerald-500/20 cursor-pointer"
                >
                  {isHealthChecking ? 'Testing...' : 'Test Now'}
                </button>
              </div>

              <div className="space-y-2.5">
                {systemHealth.map((srv) => (
                  <div
                    key={srv.serviceId}
                    className={`p-3 rounded-2xl shadow-soft-xs flex items-center justify-between ${
                      isDark ? 'bg-zinc-950/60' : 'bg-zinc-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{srv.name}</div>
                      <div className="text-[10px] text-zinc-400">{srv.latencyMs}ms latency • {srv.lastChecked}</div>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      srv.status === 'operational' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`} />
                  </div>
                ))}
              </div>

              {/* Real Value Generated Banner */}
              <div className={`p-4 rounded-2xl shadow-soft-xs ${isDark ? 'bg-purple-950/30 text-purple-200' : 'bg-purple-50 text-purple-900'}`}>
                <div className="flex items-center gap-2 font-extrabold text-xs mb-1">
                  <Activity className="w-3.5 h-3.5 text-purple-400" />
                  <span>Real Value Metrics</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {kpis.totalSlidesGenerated} slides synthesized across {kpis.totalDecksCreated} presentations in Firestore, saving an estimated <strong>${kpis.estimatedCostSavingsUSD}</strong> in preparation time.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB: MASTER SLIDE TEMPLATE ARCHITECT (CANVA & PPT-STYLE STUDIO) */}
      {/* ========================================================================= */}
      {activeSubTab === 'template_architect' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Banner */}
          <div className={`p-6 sm:p-7 rounded-3xl transition-all shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-5 ${
            isDark ? 'bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-purple-950/30' : 'bg-gradient-to-r from-indigo-50 via-white to-purple-50'
          }`}>
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                  <LayoutTemplate className="w-3 h-3" />
                  Admin Master Template Studio
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Canva &amp; PPT Designer Beta
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Master Presentation Templates &amp; Visual Layout Architect
              </h2>
              <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Design and configure reusable master presentation templates with drag-and-drop text boxes, geometric vector shapes, media slots, and dynamic AI variable bindings. Soon, teachers will select your master templates, and the AI will auto-populate their lesson into your custom slides!
              </p>
            </div>

            <button
              onClick={() => {
                const blank = createBlankMasterTemplate('New Custom Master Template', 'Tech & Modern');
                setEditingTemplate(blank);
                setIsStudioOpen(true);
              }}
              className="px-5 py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-soft-md hover:scale-[1.02] transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Master Template</span>
            </button>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className={`p-4 rounded-3xl shadow-soft-sm flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isDark ? 'bg-zinc-900/90' : 'bg-white'
          }`}>
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Search master templates..."
                className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark ? 'bg-zinc-950 text-white placeholder-zinc-500' : 'bg-zinc-100 text-zinc-900 placeholder-zinc-400'
                }`}
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
              {['ALL', 'Tech & Modern', 'Academic & Clean', 'Playful & Creative', 'Dark Futuristic'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTemplateCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    templateCategoryFilter === cat
                      ? isDark ? 'bg-white text-zinc-950 shadow-soft-xs' : 'bg-zinc-900 text-white shadow-soft-xs'
                      : isDark ? 'bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Master Templates Grid */}
          {templates.length === 0 ? (
            <div className={`p-12 text-center rounded-3xl space-y-3 shadow-soft-sm ${
              isDark ? 'bg-zinc-900/60' : 'bg-white'
            }`}>
              <LayoutTemplate className="w-8 h-8 mx-auto text-indigo-400 opacity-60" />
              <h4 className="font-bold text-sm">No Master Templates Created Yet</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Click "Create Master Template" above to launch the visual Canva &amp; PPT canvas editor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates
                .filter((t) => {
                  const matchSearch =
                    templateSearch === '' ||
                    t.title.toLowerCase().includes(templateSearch.toLowerCase()) ||
                    t.description.toLowerCase().includes(templateSearch.toLowerCase());
                  const matchCat = templateCategoryFilter === 'ALL' || t.category === templateCategoryFilter;
                  return matchSearch && matchCat;
                })
                .map((tmpl) => {
                  const firstSlide = tmpl.slides[0];
                  return (
                    <div
                      key={tmpl.id}
                      className={`p-5 rounded-3xl shadow-soft-sm flex flex-col justify-between space-y-4 transition-all hover:scale-[1.01] ${
                        isDark ? 'bg-zinc-900/90 hover:bg-zinc-850' : 'bg-white hover:bg-zinc-50'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Mini Canvas Preview */}
                        <div
                          onClick={() => {
                            setEditingTemplate(tmpl);
                            setIsStudioOpen(true);
                          }}
                          style={{
                            background:
                              firstSlide?.background.type === 'gradient' && firstSlide.background.gradient
                                ? firstSlide.background.gradient
                                : firstSlide?.background.color || '#09090b',
                          }}
                          className="w-full aspect-video rounded-2xl p-4 flex flex-col justify-between overflow-hidden relative border border-white/10 cursor-pointer group shadow-soft-md"
                        >
                          <div className="flex items-center justify-between z-10">
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-black/60 text-white backdrop-blur-md">
                              {tmpl.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase flex items-center gap-1 backdrop-blur-md ${
                              tmpl.isPublished
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                                : 'bg-black/60 text-amber-300'
                            }`}>
                              {tmpl.isPublished ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                              {tmpl.isPublished ? 'Live' : 'Draft'}
                            </span>
                          </div>

                          {/* Simplified Mini Graphic representation */}
                          <div className="space-y-1.5 z-10">
                            <div className="h-4 w-3/4 bg-white/30 rounded-md" />
                            <div className="h-2.5 w-1/2 bg-white/20 rounded-md" />
                          </div>

                          {/* Hover Launch Overlay */}
                          <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs">
                            <Presentation className="w-4 h-4 text-indigo-400" />
                            <span>Launch Canva Studio</span>
                          </div>
                        </div>

                        {/* Template Details */}
                        <div className="space-y-1">
                          <h3 className="font-display text-base font-bold line-clamp-1">{tmpl.title}</h3>
                          <p className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            {tmpl.description}
                          </p>
                        </div>

                        {/* Meta Tags */}
                        <div className="flex items-center gap-2 flex-wrap text-[11px] text-zinc-400">
                          <span className="px-2 py-0.5 rounded-lg bg-zinc-800 font-semibold text-zinc-300">
                            {tmpl.slides.length} Master Layout{tmpl.slides.length > 1 ? 's' : ''}
                          </span>
                          <span className="font-mono text-[10px]">
                            {tmpl.fontPairing.headingFont.split(',')[0]}
                          </span>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-2 flex items-center justify-between border-t border-zinc-800/60">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={async () => {
                              const updatedTmpl: PresentationTemplate = {
                                ...tmpl,
                                isPublished: !tmpl.isPublished,
                              };
                              await saveAdminTemplateToFirestore(updatedTmpl);
                              setTemplates((prev) => prev.map((t) => (t.id === tmpl.id ? updatedTmpl : t)));
                              showToast(`Template ${updatedTmpl.isPublished ? 'published to platform' : 'set to admin draft'}`);
                            }}
                            className={`p-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                              tmpl.isPublished
                                ? 'text-emerald-400 hover:bg-emerald-500/10'
                                : 'text-zinc-400 hover:bg-zinc-800'
                            }`}
                            title={tmpl.isPublished ? 'Unpublish template' : 'Publish template'}
                          >
                            {tmpl.isPublished ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={async () => {
                              const duplicated: PresentationTemplate = {
                                ...tmpl,
                                id: `tmpl_${Date.now().toString(36)}`,
                                title: `${tmpl.title} (Copy)`,
                                isPublished: false,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                              };
                              const saved = await saveAdminTemplateToFirestore(duplicated);
                              setTemplates((prev) => [saved, ...prev]);
                              showToast('Template duplicated successfully');
                            }}
                            className="p-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-all"
                            title="Duplicate template"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={async () => {
                              if (confirm(`Delete master template "${tmpl.title}"?`)) {
                                await deleteAdminTemplateFromFirestore(tmpl.id);
                                setTemplates((prev) => prev.filter((t) => t.id !== tmpl.id));
                                showToast('Template deleted');
                              }
                            }}
                            className="p-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-all"
                            title="Delete template"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            setEditingTemplate(tmpl);
                            setIsStudioOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 shadow-soft-xs cursor-pointer"
                        >
                          <LayoutTemplate className="w-3 h-3" />
                          <span>Launch Studio</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: REAL AUDIT LOGS STREAM */}
      {/* ========================================================================= */}
      {activeSubTab === 'logs' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Filter Bar & Export Actions */}
          <div className={`p-4 rounded-3xl shadow-soft-sm space-y-3 ${isDark ? 'bg-zinc-900/90 text-white' : 'bg-white text-zinc-900'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search Box */}
              <div className={`relative w-full sm:w-80 flex items-center rounded-2xl shadow-soft-xs ${
                isDark ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-900'
              }`}>
                <Search className="w-4 h-4 ml-3 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Search real logs by action, email, keyword..."
                  className="w-full bg-transparent px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              {/* Action Buttons: Export JSON, Export CSV, Clear */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                <button
                  onClick={handleExportLogsJSON}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-soft-xs ${
                    isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={handleExportLogsCSV}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-soft-xs ${
                    isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={handleClearLogs}
                  className={`p-2 rounded-xl text-xs transition-all cursor-pointer text-zinc-400 hover:text-red-400 ${
                    isDark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'
                  }`}
                  title="Clear local log view"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Chips: Level & Category */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">
                Level:
              </span>
              {['ALL', 'SUCCESS', 'INFO', 'WARN', 'ERROR'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    selectedLevel === lvl
                      ? isDark ? 'bg-white text-zinc-950 shadow-soft-xs' : 'bg-zinc-900 text-white shadow-soft-xs'
                      : isDark ? 'bg-zinc-950 text-zinc-400 hover:text-white' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}

              <div className={`w-px h-4 mx-1 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />

              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">
                Category:
              </span>
              {['ALL', 'AI_GEN', 'API_CALL', 'AUTH', 'EXPORT', 'FIRESTORE', 'SYSTEM', 'SECURITY'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white shadow-soft-xs'
                      : isDark ? 'bg-zinc-950 text-zinc-400 hover:text-white' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Logs List Table */}
          <div className={`rounded-3xl shadow-soft-sm overflow-hidden ${isDark ? 'bg-zinc-900/90 text-white' : 'bg-white text-zinc-900'}`}>
            <div className="p-4 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400">
                Showing {filteredLogs.length} real audit entries
              </span>
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Firestore Stream
              </span>
            </div>

            <div className="divide-y divide-transparent overflow-x-auto">
              {filteredLogs.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 text-xs">
                  No log entries matched your filter criteria.
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`p-4 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isDark ? 'hover:bg-zinc-800/60' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase shrink-0 shadow-soft-xs ${
                        log.level === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : log.level === 'ERROR'
                          ? 'bg-red-500/20 text-red-400'
                          : log.level === 'WARN'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-indigo-500/20 text-indigo-400'
                      }`}>
                        {log.level}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold">{log.action}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400">
                            {log.category}
                          </span>
                          <span className="text-[11px] text-zinc-400 truncate hidden md:inline">
                            {log.userEmail}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 truncate ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                          {log.details}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {log.metadata?.latencyMs ? `${log.metadata.latencyMs}ms` : 'Recorded'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: REAL GEMINI API & TOKEN CONSUMPTION */}
      {/* ========================================================================= */}
      {activeSubTab === 'api_usage' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Real Token Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-5 rounded-3xl shadow-soft-sm ${isDark ? 'bg-zinc-900/90 text-white' : 'bg-white text-zinc-900'}`}>
              <span className="text-xs font-semibold text-zinc-400">Total Tracked Token Flow</span>
              <div className="text-3xl font-extrabold tracking-tight mt-1 text-purple-400">
                {kpis.totalTokensProcessed.toLocaleString()}
              </div>
              <p className="text-[11px] text-zinc-400 mt-2">
                Accumulated across {kpis.totalAPICalls} verified generation actions.
              </p>
            </div>

            <div className={`p-5 rounded-3xl shadow-soft-sm ${isDark ? 'bg-zinc-900/90 text-white' : 'bg-white text-zinc-900'}`}>
              <span className="text-xs font-semibold text-zinc-400">Measured Average Latency</span>
              <div className="text-3xl font-extrabold tracking-tight mt-1 text-indigo-400">
                {kpis.avgLatencyMs}ms
              </div>
              <p className="text-[11px] text-zinc-400 mt-2">
                Real measured round-trip timing from Google Gemini 2.5 Flash.
              </p>
            </div>

            <div className={`p-5 rounded-3xl shadow-soft-sm ${isDark ? 'bg-zinc-900/90 text-white' : 'bg-white text-zinc-900'}`}>
              <span className="text-xs font-semibold text-zinc-400">Gateway Success Rate</span>
              <div className="text-3xl font-extrabold tracking-tight mt-1 text-emerald-400">
                {kpis.uptimePercentage}%
              </div>
              <p className="text-[11px] text-zinc-400 mt-2">
                Error rate: <strong>{kpis.errorRatePercentage}%</strong> across real log records.
              </p>
            </div>
          </div>

          {/* Real Endpoints Consumption Table */}
          <div className={`p-6 rounded-3xl shadow-soft-sm space-y-4 ${isDark ? 'bg-zinc-900/90 text-white' : 'bg-white text-zinc-900'}`}>
            <h3 className="font-extrabold text-sm">Real Endpoint Activity & Latency Breakdown</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`text-[11px] uppercase tracking-wider font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    <th className="pb-3 px-2">Endpoint</th>
                    <th className="pb-3 px-2">Engine</th>
                    <th className="pb-3 px-2">Real Invocations</th>
                    <th className="pb-3 px-2">Avg Latency</th>
                    <th className="pb-3 px-2">Tokens</th>
                    <th className="pb-3 px-2">Success Rate</th>
                    <th className="pb-3 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-transparent">
                  {apiMetrics.map((ep) => (
                    <tr
                      key={ep.endpoint}
                      className={`transition-colors ${isDark ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-50'}`}
                    >
                      <td className="py-3.5 px-2 font-mono font-bold text-indigo-400">{ep.endpoint}</td>
                      <td className="py-3.5 px-2">{ep.model}</td>
                      <td className="py-3.5 px-2 font-bold">{ep.calls24h}</td>
                      <td className="py-3.5 px-2 font-mono">{ep.avgLatencyMs}ms</td>
                      <td className="py-3.5 px-2 font-mono">{ep.tokensProcessed.toLocaleString()}</td>
                      <td className="py-3.5 px-2">
                        <span className="text-emerald-400 font-bold">{ep.successRate}%</span>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400">
                          {ep.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: REAL PRESENTATIONS & DECK ANALYTICS */}
      {/* ========================================================================= */}
      {activeSubTab === 'deck_analytics' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className={`p-6 rounded-3xl shadow-soft-sm space-y-4 ${isDark ? 'bg-zinc-900/90 text-white' : 'bg-white text-zinc-900'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm">Real Platform Presentations Inspector</h3>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Inspect all {platformDecks.length} presentations stored in Firestore.
                </p>
              </div>

              <div className={`relative w-full sm:w-72 flex items-center rounded-2xl shadow-soft-xs ${
                isDark ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-900'
              }`}>
                <Search className="w-4 h-4 ml-3 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  value={deckSearch}
                  onChange={(e) => setDeckSearch(e.target.value)}
                  placeholder="Filter by title, subject, audience..."
                  className="w-full bg-transparent px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            {filteredDecks.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 text-xs">
                No presentations found in the Firestore database matching your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {filteredDecks.map((deck) => (
                  <div
                    key={deck.id}
                    className={`p-5 rounded-2xl shadow-soft-xs hover:shadow-soft-md transition-all flex flex-col justify-between ${
                      isDark ? 'bg-zinc-950/70 text-white' : 'bg-zinc-50 text-zinc-900'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-400">
                          {deck.subject || 'General'}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {deck.slides?.length || 0} Slides
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm leading-snug line-clamp-2">
                        {deck.title}
                      </h4>

                      <p className="text-[11px] text-zinc-400 line-clamp-2">
                        {deck.pedagogyNotes || 'Educational presentation deck.'}
                      </p>

                      <div className="text-[10px] text-zinc-500 font-mono pt-1">
                        ID: {deck.id}
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setInspectingDeck(deck)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-soft-xs ${
                            isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-white hover:bg-zinc-200 text-zinc-800'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>

                        <button
                          onClick={() => setDeletingDeckId(deck.id || null)}
                          className={`p-1.5 rounded-xl text-xs transition-colors cursor-pointer text-zinc-400 hover:text-red-400 ${
                            isDark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-200'
                          }`}
                          title="Delete from Firestore"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {onOpenDeckInStudio && (
                        <button
                          onClick={() => onOpenDeckInStudio(deck)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-soft-xs"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Studio</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: REAL EDUCATOR & USER MANAGEMENT */}
      {/* ========================================================================= */}
      {activeSubTab === 'user_management' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className={`p-6 rounded-3xl shadow-soft-sm space-y-4 ${isDark ? 'bg-zinc-900/90 text-white' : 'bg-white text-zinc-900'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm">Real Registered Users Directory</h3>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Manage educator permissions, access roles, and status directly in Firestore.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className={`relative flex-1 sm:w-64 flex items-center rounded-2xl shadow-soft-xs ${
                  isDark ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-900'
                }`}>
                  <Search className="w-4 h-4 ml-3 text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search real users..."
                    className="w-full bg-transparent px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className={`px-3 py-2 rounded-2xl text-xs font-bold shadow-soft-xs focus:outline-none cursor-pointer ${
                    isDark ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-900'
                  }`}
                >
                  <option value="ALL">All Roles</option>
                  <option value="admin">Administrators</option>
                  <option value="pro_scholar">Pro Scholars</option>
                  <option value="educator">Educators</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`text-[11px] uppercase tracking-wider font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    <th className="pb-3 px-3">User</th>
                    <th className="pb-3 px-3">Role</th>
                    <th className="pb-3 px-3">Decks in DB</th>
                    <th className="pb-3 px-3">Last Active</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-transparent">
                  {filteredUsers.map((u) => {
                    const isAdminUser = u.role === 'admin' || u.email.toLowerCase() === ADMIN_PRIMARY_EMAIL.toLowerCase();
                    return (
                      <tr
                        key={u.id}
                        className={`transition-colors ${isDark ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-50'}`}
                      >
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-soft-xs">
                              {u.displayName[0]?.toUpperCase() || u.email[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="font-extrabold flex items-center gap-1.5">
                                <span>{u.displayName}</span>
                                {isAdminUser && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-purple-500/20 text-purple-400">
                                    Root Admin
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-zinc-400 font-mono">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase shadow-soft-xs ${
                            isAdminUser
                              ? 'bg-purple-500/20 text-purple-400'
                              : u.role === 'pro_scholar'
                              ? 'bg-indigo-500/20 text-indigo-400'
                              : isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'
                          }`}>
                            {isAdminUser ? 'Admin' : u.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 font-bold">{u.decksCount} decks</td>
                        <td className="py-3.5 px-3 text-zinc-400">{u.lastActive}</td>

                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            u.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {u.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          {!isAdminUser ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleRoleChange(u.id, u.role, u.displayName)}
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer shadow-soft-xs ${
                                  isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                                }`}
                              >
                                {u.role === 'educator' ? 'Promote Pro' : 'Set Educator'}
                              </button>
                              <button
                                onClick={() => handleStatusToggle(u.id, u.status, u.displayName)}
                                className={`p-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                                  u.status === 'active'
                                    ? 'text-zinc-400 hover:text-red-400'
                                    : 'text-emerald-400 hover:bg-emerald-500/10'
                                }`}
                                title={u.status === 'active' ? 'Suspend Account' : 'Re-activate'}
                              >
                                {u.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-purple-400 font-bold">Protected Account</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 6: LIVE SYSTEM HEALTH & CONTROLS */}
      {/* ========================================================================= */}
      {activeSubTab === 'system_health' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Configuration & Feature Flags */}
            <div className={`p-6 rounded-3xl shadow-soft-sm space-y-5 ${isDark ? 'bg-zinc-900/90 text-white' : 'bg-white text-zinc-900'}`}>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <h3 className="font-extrabold text-sm">AI Engine & Governance Controls</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-extrabold">Active AI Generation Engine</div>
                    <div className="text-[11px] text-zinc-400">Primary model for slide layout synthesis</div>
                  </div>
                  <select
                    value={aiModel}
                    onChange={(e: any) => {
                      setAiModel(e.target.value);
                      showToast(`AI engine set to ${e.target.value}`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-soft-xs focus:outline-none cursor-pointer ${
                      isDark ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-900'
                    }`}
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra-fast)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Research)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-extrabold">Max Slides Per Presentation</div>
                    <div className="text-[11px] text-zinc-400">Cap maximum generation volume</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="6"
                      max="20"
                      value={maxSlideLimit}
                      onChange={(e) => setMaxSlideLimit(Number(e.target.value))}
                      className="w-24 accent-purple-500 cursor-pointer"
                    />
                    <span className="font-mono font-bold w-6 text-right">{maxSlideLimit}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-extrabold">Semantic Prompt Caching</div>
                    <div className="text-[11px] text-zinc-400">Optimize repeated structural templates</div>
                  </div>
                  <button
                    onClick={() => {
                      setPromptCacheEnabled(!promptCacheEnabled);
                      showToast(`Prompt caching ${!promptCacheEnabled ? 'enabled' : 'disabled'}`);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      promptCacheEnabled ? 'bg-purple-600' : isDark ? 'bg-zinc-800' : 'bg-zinc-300'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      promptCacheEnabled ? 'left-6' : 'left-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-extrabold">Platform Maintenance Notice</div>
                    <div className="text-[11px] text-zinc-400">Show administrative status banner</div>
                  </div>
                  <button
                    onClick={() => {
                      setMaintenanceNotice(!maintenanceNotice);
                      showToast(`Maintenance notice ${!maintenanceNotice ? 'active' : 'deactivated'}`);
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      maintenanceNotice ? 'bg-amber-600' : isDark ? 'bg-zinc-800' : 'bg-zinc-300'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      maintenanceNotice ? 'left-6' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Infrastructure Health Status */}
            <div className={`p-6 rounded-3xl shadow-soft-sm space-y-4 ${isDark ? 'bg-zinc-900/90 text-white' : 'bg-white text-zinc-900'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-extrabold text-sm">Cluster & Gateway Diagnostics</h3>
                </div>
                <button
                  onClick={handleRunHealthCheck}
                  disabled={isHealthChecking}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
                >
                  {isHealthChecking ? 'Pinging...' : 'Ping All'}
                </button>
              </div>

              <div className="space-y-3">
                {systemHealth.map((srv) => (
                  <div
                    key={srv.serviceId}
                    className={`p-4 rounded-2xl shadow-soft-xs space-y-1 ${isDark ? 'bg-zinc-950/60' : 'bg-zinc-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs">{srv.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        srv.status === 'operational'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {srv.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{srv.description}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-zinc-400">
                      <span>Latency: {srv.latencyMs}ms</span>
                      <span>Uptime: {srv.uptimePercent}%</span>
                      <span>Verified: {srv.lastChecked}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AUDIT LOG INSPECTOR (JSON PAYLOAD VIEWER) */}
      {/* ========================================================================= */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedLog(null)}
          />

          <div className={`relative w-full max-w-xl rounded-3xl p-6 shadow-soft-xl animate-in zoom-in-95 duration-200 ${
            isDark ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-900'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-lg text-xs font-extrabold ${
                  selectedLog.level === 'SUCCESS'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : selectedLog.level === 'ERROR'
                    ? 'bg-red-500/20 text-red-400'
                    : selectedLog.level === 'WARN'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-indigo-500/20 text-indigo-400'
                }`}>
                  {selectedLog.level}
                </span>
                <h3 className="font-extrabold text-sm">{selectedLog.action}</h3>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className={`p-1.5 rounded-full ${isDark ? 'hover:bg-zinc-900 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className={`p-3 rounded-2xl ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                <div className="text-[11px] text-zinc-400 mb-1">Details:</div>
                <div className="font-semibold">{selectedLog.details}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className={`p-3 rounded-2xl ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                  <span className="text-zinc-400">Actor Email:</span>
                  <div className="font-mono font-bold truncate mt-0.5">{selectedLog.userEmail}</div>
                </div>
                <div className={`p-3 rounded-2xl ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                  <span className="text-zinc-400">Timestamp:</span>
                  <div className="font-mono font-bold mt-0.5">{new Date(selectedLog.timestamp).toLocaleString()}</div>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-zinc-400 mb-1 font-bold">Metadata Payload:</div>
                <pre className={`p-3 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-48 scrollbar-none ${
                  isDark ? 'bg-zinc-900 text-purple-300' : 'bg-zinc-100 text-purple-800'
                }`}>
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900'
                }`}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DECK INSPECTOR (ADMIN PREVIEW) */}
      {/* ========================================================================= */}
      {inspectingDeck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={() => setInspectingDeck(null)}
          />

          <div className={`relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl p-6 shadow-soft-xl animate-in zoom-in-95 duration-200 ${
            isDark ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-transparent">
              <div>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-400">
                  {inspectingDeck.subject}
                </span>
                <h3 className="font-extrabold text-base mt-1">{inspectingDeck.title}</h3>
              </div>

              <button
                onClick={() => setInspectingDeck(null)}
                className={`p-1.5 rounded-full ${isDark ? 'hover:bg-zinc-900 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'}`}
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-none">
              <div className={`p-3 rounded-2xl text-xs ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                <strong>Pedagogy Notes:</strong> {inspectingDeck.pedagogyNotes || 'No notes provided.'}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-400">
                  Slides ({inspectingDeck.slides?.length || 0}):
                </span>
                {inspectingDeck.slides?.map((slide, i) => (
                  <div
                    key={slide.id || i}
                    className={`p-3.5 rounded-2xl text-xs space-y-1.5 ${isDark ? 'bg-zinc-900/60' : 'bg-zinc-100'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-indigo-400">Slide {slide.slideNumber}: {slide.title}</span>
                      <span className="text-[10px] font-mono text-zinc-400">{slide.layoutType}</span>
                    </div>
                    <p className="font-medium text-[11px]">{slide.headline}</p>
                    <ul className="list-disc list-inside text-[11px] text-zinc-400 space-y-0.5">
                      {slide.bullets?.slice(0, 2).map((b, bIdx) => (
                        <li key={bIdx} className="truncate">{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Audience: {inspectingDeck.targetAudience}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeletingDeckId(inspectingDeck.id || null)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 cursor-pointer"
                >
                  Delete Deck
                </button>
                {onOpenDeckInStudio && (
                  <button
                    onClick={() => {
                      onOpenDeckInStudio(inspectingDeck);
                      setInspectingDeck(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-soft-xs cursor-pointer"
                  >
                    Open in Studio
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE DECK CONFIRMATION */}
      {/* ========================================================================= */}
      {deletingDeckId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={() => setDeletingDeckId(null)}
          />

          <div className={`relative w-full max-w-sm rounded-3xl p-6 shadow-soft-xl animate-in zoom-in-95 duration-200 ${
            isDark ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-900'
          }`}>
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">Delete Presentation?</h3>
                <p className="text-[11px] text-zinc-400">This will permanently delete it from Firestore.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                onClick={() => setDeletingDeckId(null)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                  isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const targetDeck = platformDecks.find((d) => d.id === deletingDeckId);
                  if (targetDeck) {
                    handleDeleteDeck(targetDeck);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white cursor-pointer shadow-soft-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FULL-SCREEN CANVA & PPT MASTER TEMPLATE ARCHITECT STUDIO */}
      {/* ========================================================================= */}
      {isStudioOpen && editingTemplate && (
        <TemplateArchitectStudio
          template={editingTemplate}
          onSave={(savedTemplate) => {
            setTemplates((prev) => {
              const existingIndex = prev.findIndex((t) => t.id === savedTemplate.id);
              if (existingIndex >= 0) {
                const next = [...prev];
                next[existingIndex] = savedTemplate;
                return next;
              }
              return [savedTemplate, ...prev];
            });
            setEditingTemplate(savedTemplate);
            showToast(`Master template "${savedTemplate.title}" saved successfully`);
          }}
          onClose={() => {
            setIsStudioOpen(false);
            setEditingTemplate(null);
          }}
          isDark={isDark}
        />
      )}
    </div>
  );
};
