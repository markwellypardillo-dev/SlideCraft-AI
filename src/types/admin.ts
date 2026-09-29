export type AdminSubTab =
  | 'overview'
  | 'template_architect'
  | 'logs'
  | 'api_usage'
  | 'deck_analytics'
  | 'user_management'
  | 'system_health';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'DEBUG';

export type LogCategory =
  | 'AUTH'
  | 'AI_GEN'
  | 'API_CALL'
  | 'EXPORT'
  | 'SYSTEM'
  | 'SECURITY'
  | 'FIRESTORE';

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  action: string;
  userEmail: string;
  userId?: string;
  details: string;
  metadata?: {
    endpoint?: string;
    latencyMs?: number;
    tokenCount?: {
      prompt: number;
      completion: number;
      total: number;
    };
    status?: number;
    slideCount?: number;
    format?: string;
    subject?: string;
    errorMessage?: string;
    ipHash?: string;
    model?: string;
    [key: string]: any;
  };
}

export interface AdminKPIs {
  activeUsersCount: number;
  dailyActiveUsers: number;
  totalDecksCreated: number;
  totalSlidesGenerated: number;
  totalRegisteredUsers: number;
  totalAPICalls: number;
  totalTokensProcessed: number;
  avgLatencyMs: number;
  estimatedCostSavingsUSD: number;
  uptimePercentage: number;
  errorRatePercentage: number;
  geminiCallsToday: number;
}

export interface APIEndpointMetric {
  endpoint: string;
  method: string;
  model: string;
  calls24h: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  tokensProcessed: number;
  successRate: number;
  lastCalled: string;
  status: 'optimal' | 'warning' | 'degraded';
}

export interface UserAccountSummary {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'educator' | 'pro_scholar';
  decksCount: number;
  lastActive: string;
  createdAt: string;
  status: 'active' | 'flagged' | 'suspended';
  storageUsedKb: number;
  photoURL?: string;
}

export interface SystemServiceHealth {
  name: string;
  serviceId: string;
  status: 'operational' | 'degraded' | 'maintenance' | 'outage';
  latencyMs: number;
  uptimePercent: number;
  lastChecked: string;
  description: string;
}

export interface SystemConfigSettings {
  aiGenerationEngine: 'gemini-2.5-flash' | 'gemini-1.5-pro' | 'gemini-flash-lite';
  maxSlidesPerGeneration: number;
  enableExportWatermark: boolean;
  rateLimitPerUserMinute: number;
  enableLiveAuditStreaming: boolean;
  maintenanceModeActive: boolean;
  promptCachingOptimization: boolean;
  debugVerboseLogging: boolean;
}
