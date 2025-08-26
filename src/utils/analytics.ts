import { 
  Account, 
  Transaction, 
  Currency, 
  DateRange, 
  AnalyticsData,
  TransactionVolumeData,
  AccountPerformanceData,
  CurrencyAnalyticsData,
  RiskMetrics,
  TrendData,
  AnalyticsSummary,
  ReportData,
  ReportConfig
} from '../types';

// Date utility functions
export const getDateRange = (days: number, endDate?: Date): DateRange => {
  const end = endDate || new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const isDateInRange = (date: Date, range: DateRange): boolean => {
  return date >= range.start && date <= range.end;
};

// Transaction filtering
export const filterTransactionsByDateRange = (
  transactions: Transaction[], 
  dateRange: DateRange
): Transaction[] => {
  return transactions.filter(tx => isDateInRange(tx.timestamp, dateRange));
};

export const filterTransactionsByCurrency = (
  transactions: Transaction[], 
  currency: Currency
): Transaction[] => {
  return transactions.filter(tx => tx.currency === currency);
};

export const filterTransactionsByAccount = (
  transactions: Transaction[], 
  accountId: string
): Transaction[] => {
  return transactions.filter(tx => 
    tx.fromAccountId === accountId || tx.toAccountId === accountId
  );
};

// Transaction volume analysis
export const calculateTransactionVolume = (
  transactions: Transaction[],
  dateRange: DateRange,
  currency?: Currency
): TransactionVolumeData[] => {
  let filteredTransactions = filterTransactionsByDateRange(transactions, dateRange);
  
  if (currency) {
    filteredTransactions = filterTransactionsByCurrency(filteredTransactions, currency);
  }

  const volumeMap = new Map<string, { volume: number; count: number }>();
  
  filteredTransactions.forEach(tx => {
    const dateKey = formatDate(tx.timestamp);
    const existing = volumeMap.get(dateKey) || { volume: 0, count: 0 };
    
    volumeMap.set(dateKey, {
      volume: existing.volume + tx.amount,
      count: existing.count + 1
    });
  });

  const result: TransactionVolumeData[] = [];
  const currentDate = new Date(dateRange.start);
  
  while (currentDate <= dateRange.end) {
    const dateKey = formatDate(currentDate);
    const data = volumeMap.get(dateKey) || { volume: 0, count: 0 };
    
    result.push({
      date: dateKey,
      volume: data.volume,
      count: data.count,
      currency: currency || 'USD' // Default currency if not specified
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
};

// Account performance analysis
export const calculateAccountPerformance = (
  accounts: Account[],
  transactions: Transaction[],
  dateRange: DateRange
): AccountPerformanceData[] => {
  const filteredTransactions = filterTransactionsByDateRange(transactions, dateRange);
  
  return accounts
    .filter(account => account.isActive)
    .map(account => {
      const accountTransactions = filterTransactionsByAccount(filteredTransactions, account.id);
      
      const inbound = accountTransactions
        .filter(tx => tx.toAccountId === account.id)
        .reduce((sum, tx) => sum + (tx.convertedAmount || tx.amount), 0);
      
      const outbound = accountTransactions
        .filter(tx => tx.fromAccountId === account.id)
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const netFlow = inbound - outbound;
      const transactionCount = accountTransactions.length;
      const averageTransactionSize = transactionCount > 0 ? 
        (inbound + outbound) / transactionCount : 0;
      
      // Performance scoring
      let performance: 'high' | 'medium' | 'low' = 'low';
      if (transactionCount >= 10 && Math.abs(netFlow) > 1000) {
        performance = 'high';
      } else if (transactionCount >= 5 && Math.abs(netFlow) > 500) {
        performance = 'medium';
      }

      return {
        accountId: account.id,
        accountName: account.name,
        totalInbound: inbound,
        totalOutbound: outbound,
        netFlow,
        transactionCount,
        averageTransactionSize,
        currency: account.currency,
        performance
      };
    });
};

// Currency analytics
export const calculateCurrencyAnalytics = (
  accounts: Account[],
  transactions: Transaction[],
  dateRange: DateRange
): CurrencyAnalyticsData[] => {
  const filteredTransactions = filterTransactionsByDateRange(transactions, dateRange);
  const currencies: Currency[] = ['USD', 'KES', 'NGN'];
  
  const totalVolume = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  
  return currencies.map(currency => {
    const currencyAccounts = accounts.filter(acc => acc.currency === currency && acc.isActive);
    const currencyTransactions = filteredTransactions.filter(tx => tx.currency === currency);
    
    const totalBalance = currencyAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalTransactionVolume = currencyTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const transactionCount = currencyTransactions.length;
    const averageTransactionSize = transactionCount > 0 ? 
      totalTransactionVolume / transactionCount : 0;
    const marketShare = totalVolume > 0 ? (totalTransactionVolume / totalVolume) * 100 : 0;

    return {
      currency,
      totalBalance,
      totalTransactionVolume,
      transactionCount,
      averageTransactionSize,
      marketShare
    };
  });
};

// Risk metrics calculation
export const calculateRiskMetrics = (
  accounts: Account[],
  transactions: Transaction[],
  dateRange: DateRange
): RiskMetrics => {
  const activeAccounts = accounts.filter(acc => acc.isActive);
  const filteredTransactions = filterTransactionsByDateRange(transactions, dateRange);
  
  // Liquidity Risk: Based on low balance accounts
  const lowBalanceThresholds = { USD: 100, KES: 10000, NGN: 50000 };
  const lowBalanceAccounts = activeAccounts.filter(acc => 
    acc.balance < lowBalanceThresholds[acc.currency]
  );
  const liquidityRisk = Math.min((lowBalanceAccounts.length / activeAccounts.length) * 100, 100);

  // Concentration Risk: Based on balance distribution
  const totalBalance = activeAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const maxAccountBalance = Math.max(...activeAccounts.map(acc => acc.balance));
  const concentrationRisk = totalBalance > 0 ? (maxAccountBalance / totalBalance) * 100 : 0;

  // Volatility Risk: Based on transaction volume variance
  const dailyVolumes = calculateTransactionVolume(transactions, dateRange)
    .map(data => data.volume);
  const avgVolume = dailyVolumes.reduce((sum, vol) => sum + vol, 0) / dailyVolumes.length || 0;
  const variance = dailyVolumes.reduce((sum, vol) => sum + Math.pow(vol - avgVolume, 2), 0) / dailyVolumes.length || 0;
  const volatilityRisk = Math.min((Math.sqrt(variance) / avgVolume) * 100, 100) || 0;

  // Overall risk score
  const overallRiskScore = (liquidityRisk * 0.4 + concentrationRisk * 0.3 + volatilityRisk * 0.3);
  
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (overallRiskScore >= 75) riskLevel = 'critical';
  else if (overallRiskScore >= 50) riskLevel = 'high';
  else if (overallRiskScore >= 25) riskLevel = 'medium';
  else riskLevel = 'low';

  const recommendations: string[] = [];
  if (liquidityRisk > 30) {
    recommendations.push('Consider increasing account balances to improve liquidity');
  }
  if (concentrationRisk > 50) {
    recommendations.push('Diversify balance distribution across accounts');
  }
  if (volatilityRisk > 40) {
    recommendations.push('Monitor transaction patterns for unusual volatility');
  }

  return {
    liquidityRisk,
    concentrationRisk,
    volatilityRisk,
    overallRiskScore,
    riskLevel,
    recommendations,
    lowBalanceAccounts
  };
};

// Trend analysis
export const calculateTrends = (
  transactions: Transaction[],
  dateRange: DateRange,
  previousPeriod?: DateRange
): TrendData => {
  if (!previousPeriod) {
    return {
      transactionTrend: 'stable',
      volumeTrend: 'stable',
      balanceTrend: 'stable',
      transactionGrowth: 0,
      volumeGrowth: 0,
      balanceGrowth: 0
    };
  }

  const currentTransactions = filterTransactionsByDateRange(transactions, dateRange);
  const previousTransactions = filterTransactionsByDateRange(transactions, previousPeriod);

  const currentCount = currentTransactions.length;
  const previousCount = previousTransactions.length;
  const transactionGrowth = previousCount > 0 ? 
    ((currentCount - previousCount) / previousCount) * 100 : 0;

  const currentVolume = currentTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const previousVolume = previousTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const volumeGrowth = previousVolume > 0 ? 
    ((currentVolume - previousVolume) / previousVolume) * 100 : 0;

  // For balance trend, we'll use transaction net flow as a proxy
  const currentNetFlow = currentTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const previousNetFlow = previousTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const balanceGrowth = previousNetFlow > 0 ? 
    ((currentNetFlow - previousNetFlow) / previousNetFlow) * 100 : 0;

  const getTrend = (growth: number) => {
    if (growth > 5) return 'up';
    if (growth < -5) return 'down';
    return 'stable';
  };

  return {
    transactionTrend: getTrend(transactionGrowth),
    volumeTrend: getTrend(volumeGrowth),
    balanceTrend: getTrend(balanceGrowth),
    transactionGrowth,
    volumeGrowth,
    balanceGrowth
  };
};

// Analytics summary
export const calculateAnalyticsSummary = (
  accounts: Account[],
  transactions: Transaction[],
  dateRange: DateRange,
  previousPeriod?: DateRange
): AnalyticsSummary => {
  const activeAccounts = accounts.filter(acc => acc.isActive);
  const filteredTransactions = filterTransactionsByDateRange(transactions, dateRange);

  const totalTransactionVolume = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalTransactionCount = filteredTransactions.length;
  const averageTransactionSize = totalTransactionCount > 0 ? 
    totalTransactionVolume / totalTransactionCount : 0;
  
  const largestTransaction = filteredTransactions.length > 0 ?
    Math.max(...filteredTransactions.map(tx => tx.amount)) : 0;

  // Find most active account
  const accountActivity = new Map<string, number>();
  filteredTransactions.forEach(tx => {
    accountActivity.set(tx.fromAccountId, (accountActivity.get(tx.fromAccountId) || 0) + 1);
    accountActivity.set(tx.toAccountId, (accountActivity.get(tx.toAccountId) || 0) + 1);
  });
  
  let mostActiveAccount = '';
  let maxActivity = 0;
  accountActivity.forEach((count, accountId) => {
    if (count > maxActivity) {
      maxActivity = count;
      mostActiveAccount = accounts.find(acc => acc.id === accountId)?.name || accountId;
    }
  });

  // Find most used currency
  const currencyUsage = new Map<Currency, number>();
  filteredTransactions.forEach(tx => {
    currencyUsage.set(tx.currency, (currencyUsage.get(tx.currency) || 0) + 1);
  });
  
  let mostUsedCurrency: Currency = 'USD';
  let maxUsage = 0;
  currencyUsage.forEach((count, currency) => {
    if (count > maxUsage) {
      maxUsage = count;
      mostUsedCurrency = currency;
    }
  });

  let previousPeriodComparison;
  if (previousPeriod) {
    const previousTransactions = filterTransactionsByDateRange(transactions, previousPeriod);
    const previousVolume = previousTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const previousCount = previousTransactions.length;
    const previousBalance = activeAccounts.reduce((sum, acc) => sum + acc.balance, 0); // Current balance as proxy

    previousPeriodComparison = {
      volumeChange: previousVolume > 0 ? ((totalTransactionVolume - previousVolume) / previousVolume) * 100 : 0,
      countChange: previousCount > 0 ? ((totalTransactionCount - previousCount) / previousCount) * 100 : 0,
      balanceChange: 0 // Would need historical balance data
    };
  }

  return {
    totalTransactionVolume,
    totalTransactionCount,
    activeAccountsCount: activeAccounts.length,
    averageTransactionSize,
    largestTransaction,
    mostActiveAccount,
    mostUsedCurrency,
    period: dateRange,
    previousPeriodComparison
  };
};

// Main analytics data generator
export const generateAnalyticsData = (
  accounts: Account[],
  transactions: Transaction[],
  dateRange: DateRange,
  previousPeriod?: DateRange
): AnalyticsData => {
  return {
    transactionVolume: calculateTransactionVolume(transactions, dateRange),
    accountPerformance: calculateAccountPerformance(accounts, transactions, dateRange),
    currencyAnalytics: calculateCurrencyAnalytics(accounts, transactions, dateRange),
    riskMetrics: calculateRiskMetrics(accounts, transactions, dateRange),
    trends: calculateTrends(transactions, dateRange, previousPeriod),
    summary: calculateAnalyticsSummary(accounts, transactions, dateRange, previousPeriod)
  };
};

// Export utilities
export const exportToCsv = (data: any[], filename: string): void => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJson = (data: any, filename: string): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Report generation utilities
export const generateReportData = (
  config: ReportConfig,
  accounts: Account[],
  transactions: Transaction[]
): ReportData => {
  const analytics = generateAnalyticsData(accounts, transactions, config.dateRange);
  
  let filteredTransactions = filterTransactionsByDateRange(transactions, config.dateRange);
  
  if (config.currency) {
    filteredTransactions = filterTransactionsByCurrency(filteredTransactions, config.currency);
  }
  
  if (config.accountIds && config.accountIds.length > 0) {
    filteredTransactions = filteredTransactions.filter(tx =>
      config.accountIds!.includes(tx.fromAccountId) || 
      config.accountIds!.includes(tx.toAccountId)
    );
  }

  return {
    config,
    analytics,
    generatedAt: new Date(),
    metadata: {
      totalPages: 1,
      recordCount: filteredTransactions.length,
      filters: {
        currency: config.currency,
        dateFrom: config.dateRange.start.toISOString(),
        dateTo: config.dateRange.end.toISOString()
      }
    }
  };
};
