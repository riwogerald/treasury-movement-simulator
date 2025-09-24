export interface Account {
  id: string;
  name: string;
  currency: Currency;
  balance: number;
  type: AccountType;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: Currency;
  convertedAmount?: number;
  convertedCurrency?: Currency;
  exchangeRate?: number;
  note?: string;
  timestamp: Date;
  status: TransactionStatus;
  scheduledDate?: Date;
}

export type Currency = 'KES' | 'USD' | 'NGN';
export type AccountType = 'Mpesa' | 'Bank' | 'Wallet' | 'Corporate';
export type TransactionStatus = 'completed' | 'pending' | 'scheduled' | 'failed';

export interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
}

export interface TransferFormData {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  note?: string;
  scheduledDate?: string;
}

export interface FilterOptions {
  currency?: Currency;
  accountId?: string;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
  status?: TransactionStatus;
}

// Analytics Types
export interface DateRange {
  start: Date;
  end: Date;
}

export interface AnalyticsData {
  transactionVolume: TransactionVolumeData[];
  accountPerformance: AccountPerformanceData[];
  currencyAnalytics: CurrencyAnalyticsData[];
  riskMetrics: RiskMetrics;
  trends: TrendData;
  summary: AnalyticsSummary;
}

export interface TransactionVolumeData {
  date: string;
  volume: number;
  count: number;
  currency: Currency;
}

export interface AccountPerformanceData {
  accountId: string;
  accountName: string;
  totalInbound: number;
  totalOutbound: number;
  netFlow: number;
  transactionCount: number;
  averageTransactionSize: number;
  currency: Currency;
  performance: 'high' | 'medium' | 'low';
}

export interface CurrencyAnalyticsData {
  currency: Currency;
  totalBalance: number;
  totalTransactionVolume: number;
  transactionCount: number;
  averageTransactionSize: number;
  marketShare: number; // percentage
  exchangeRate?: number;
}

export interface RiskMetrics {
  liquidityRisk: number; // 0-100 score
  concentrationRisk: number; // 0-100 score
  volatilityRisk: number; // 0-100 score
  overallRiskScore: number; // 0-100 score
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  lowBalanceAccounts: Account[];
}

export interface TrendData {
  transactionTrend: 'up' | 'down' | 'stable';
  volumeTrend: 'up' | 'down' | 'stable';
  balanceTrend: 'up' | 'down' | 'stable';
  transactionGrowth: number; // percentage
  volumeGrowth: number; // percentage
  balanceGrowth: number; // percentage
}

export interface AnalyticsSummary {
  totalTransactionVolume: number;
  totalTransactionCount: number;
  activeAccountsCount: number;
  averageTransactionSize: number;
  largestTransaction: number;
  mostActiveAccount: string;
  mostUsedCurrency: Currency;
  period: DateRange;
  previousPeriodComparison?: {
    volumeChange: number;
    countChange: number;
    balanceChange: number;
  };
}

// Chart Types
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
}

export interface LineChartData {
  datasets: {
    label: string;
    data: ChartDataPoint[];
    color: string;
  }[];
}

export interface BarChartData {
  categories: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

export interface PieChartData {
  segments: {
    label: string;
    value: number;
    color: string;
    percentage: number;
  }[];
}

export interface AreaChartData {
  datasets: {
    label: string;
    data: ChartDataPoint[];
    color: string;
    fillColor: string;
  }[];
}

// Report Types
export type ReportType = 'summary' | 'detailed' | 'analytics' | 'risk' | 'performance' | 'transactions';
export type ExportFormat = 'csv' | 'json' | 'pdf';

export interface ReportConfig {
  type: ReportType;
  dateRange: DateRange;
  currency?: Currency;
  accountIds?: string[];
  includeCharts: boolean;
  format: ExportFormat;
  title: string;
  description?: string;
}

export interface ReportData {
  config: ReportConfig;
  analytics: AnalyticsData;
  generatedAt: Date;
  metadata: {
    totalPages: number;
    recordCount: number;
    filters: FilterOptions;
  };
}

// Dashboard Types
export interface KPIMetric {
  label: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  trend: 'up' | 'down' | 'stable';
  format: 'currency' | 'number' | 'percentage';
  icon?: string;
}

export interface DashboardMetrics {
  totalActiveAccounts: number;
  totalBalance: number;
  todayTransactionCount: number;
  weeklyTransactionCount: number;
  successRate: number;
  pendingTransactions: number;
  scheduledTransactions: number;
  failedTransactions: number;
}
