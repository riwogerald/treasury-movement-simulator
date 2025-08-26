import { useState, useCallback, useMemo } from 'react';
import { Account, Transaction, TransferFormData, Currency, DateRange, AnalyticsData, DashboardMetrics } from '../types';
import { INITIAL_ACCOUNTS } from '../data/constants';
import { convertCurrency } from '../utils/currency';
import { validateTransfer } from '../utils/validation';
import { 
  generateAnalyticsData, 
  getDateRange, 
  calculateAccountPerformance,
  calculateCurrencyAnalytics,
  calculateRiskMetrics,
  calculateTransactionVolume,
  filterTransactionsByAccount,
  filterTransactionsByDateRange
} from '../utils/analytics';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const updateAccountBalance = useCallback((accountId: string, newBalance: number) => {
    setAccounts(prev => 
      prev.map(account => 
        account.id === accountId 
          ? { ...account, balance: newBalance }
          : account
      )
    );
  }, []);

  const executeTransfer = useCallback((formData: TransferFormData): boolean => {
    const validation = validateTransfer(formData, accounts);
    if (!validation.isValid) {
      return false;
    }

    const fromAccount = accounts.find(a => a.id === formData.fromAccountId)!;
    const toAccount = accounts.find(a => a.id === formData.toAccountId)!;

    let transferAmount = formData.amount;
    let convertedAmount: number | undefined;
    let convertedCurrency: Currency | undefined;
    let exchangeRate: number | undefined;

    // Handle currency conversion
    if (fromAccount.currency !== toAccount.currency) {
      convertedAmount = convertCurrency(formData.amount, fromAccount.currency, toAccount.currency);
      convertedCurrency = toAccount.currency;
      exchangeRate = convertedAmount / formData.amount;
      transferAmount = convertedAmount;
    }

    // Update balances
    const newFromBalance = fromAccount.balance - formData.amount;
    const newToBalance = toAccount.balance + transferAmount;

    updateAccountBalance(fromAccount.id, newFromBalance);
    updateAccountBalance(toAccount.id, newToBalance);

    // Create transaction record
    const transaction: Transaction = {
      id: Date.now().toString(),
      fromAccountId: formData.fromAccountId,
      toAccountId: formData.toAccountId,
      amount: formData.amount,
      currency: fromAccount.currency,
      convertedAmount,
      convertedCurrency,
      exchangeRate,
      note: formData.note,
      timestamp: formData.scheduledDate ? new Date(formData.scheduledDate) : new Date(),
      status: formData.scheduledDate ? 'scheduled' : 'completed',
      scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : undefined
    };

    setTransactions(prev => [transaction, ...prev]);
    return true;
  }, [accounts, updateAccountBalance]);

  const getTotalByCurrency = useCallback((currency: Currency): number => {
    return accounts
      .filter(account => account.currency === currency && account.isActive)
      .reduce((total, account) => total + account.balance, 0);
  }, [accounts]);

  // Analytics functions
  const getAnalyticsData = useCallback((dateRange: DateRange, previousPeriod?: DateRange): AnalyticsData => {
    return generateAnalyticsData(accounts, transactions, dateRange, previousPeriod);
  }, [accounts, transactions]);

  const getAccountPerformance = useCallback((dateRange: DateRange, accountId?: string) => {
    const analyticsData = generateAnalyticsData(accounts, transactions, dateRange);
    
    if (accountId) {
      return analyticsData.accountPerformance.find(ap => ap.accountId === accountId);
    }
    
    return analyticsData.accountPerformance;
  }, [accounts, transactions]);

  const getCurrencyAnalytics = useCallback((dateRange: DateRange, currency?: Currency) => {
    const analyticsData = generateAnalyticsData(accounts, transactions, dateRange);
    
    if (currency) {
      return analyticsData.currencyAnalytics.find(ca => ca.currency === currency);
    }
    
    return analyticsData.currencyAnalytics;
  }, [accounts, transactions]);

  const getRiskMetrics = useCallback((dateRange: DateRange) => {
    const analyticsData = generateAnalyticsData(accounts, transactions, dateRange);
    return analyticsData.riskMetrics;
  }, [accounts, transactions]);

  const getTransactionVolume = useCallback((dateRange: DateRange, currency?: Currency) => {
    return calculateTransactionVolume(transactions, dateRange, currency);
  }, [transactions]);

  // Computed analytics for common use cases
  const recentAnalytics = useMemo(() => {
    const dateRange = getDateRange(30);
    const previousPeriod = {
      start: new Date(dateRange.start.getTime() - (dateRange.end.getTime() - dateRange.start.getTime())),
      end: dateRange.start
    };
    return generateAnalyticsData(accounts, transactions, dateRange, previousPeriod);
  }, [accounts, transactions]);

  const dashboardMetrics = useMemo((): DashboardMetrics => {
    const activeAccounts = accounts.filter(a => a.isActive);
    const totalBalance = activeAccounts.reduce((sum, a) => sum + a.balance, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransactions = transactions.filter(t => {
      const txDate = new Date(t.timestamp);
      txDate.setHours(0, 0, 0, 0);
      return txDate.getTime() === today.getTime();
    });
    
    const recentTransactions = transactions.filter(t => 
      t.timestamp >= getDateRange(7).start
    );
    
    return {
      totalActiveAccounts: activeAccounts.length,
      totalBalance,
      todayTransactionCount: todayTransactions.length,
      weeklyTransactionCount: recentTransactions.length,
      successRate: recentTransactions.length > 0 
        ? (recentTransactions.filter(t => t.status === 'completed').length / recentTransactions.length) * 100
        : 0,
      pendingTransactions: transactions.filter(t => t.status === 'pending').length,
      scheduledTransactions: transactions.filter(t => t.status === 'scheduled').length,
      failedTransactions: transactions.filter(t => t.status === 'failed').length
    };
  }, [accounts, transactions]);

  // Helper functions for quick insights
  const getTopPerformingAccounts = useCallback((limit: number = 5, dateRange?: DateRange) => {
    const range = dateRange || getDateRange(30);
    const performance = calculateAccountPerformance(accounts, transactions, range);
    
    return performance
      .sort((a, b) => Math.abs(b.netFlow) - Math.abs(a.netFlow))
      .slice(0, limit);
  }, [accounts, transactions]);

  const getLowBalanceAccounts = useCallback((thresholds?: Record<Currency, number>) => {
    const defaultThresholds = {
      USD: 100,
      KES: 10000,
      NGN: 50000
    };
    
    const actualThresholds = thresholds || defaultThresholds;
    
    return accounts.filter(account => 
      account.isActive && 
      account.balance < actualThresholds[account.currency]
    );
  }, [accounts]);

  const getRecentTransactions = useCallback((limit: number = 10, status?: Transaction['status']) => {
    let filteredTransactions = [...transactions].sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
    
    if (status) {
      filteredTransactions = filteredTransactions.filter(t => t.status === status);
    }
    
    return filteredTransactions.slice(0, limit).map(tx => {
      const fromAccount = accounts.find(a => a.id === tx.fromAccountId);
      const toAccount = accounts.find(a => a.id === tx.toAccountId);
      
      return {
        ...tx,
        fromAccountName: fromAccount?.name || 'Unknown',
        toAccountName: toAccount?.name || 'Unknown'
      };
    });
  }, [transactions, accounts]);

  const getTransactionsByAccount = useCallback((accountId: string, dateRange?: DateRange) => {
    let accountTransactions = filterTransactionsByAccount(transactions, accountId);
    
    if (dateRange) {
      accountTransactions = filterTransactionsByDateRange(accountTransactions, dateRange);
    }
    
    return accountTransactions.map(tx => {
      const fromAccount = accounts.find(a => a.id === tx.fromAccountId);
      const toAccount = accounts.find(a => a.id === tx.toAccountId);
      
      return {
        ...tx,
        fromAccountName: fromAccount?.name || 'Unknown',
        toAccountName: toAccount?.name || 'Unknown'
      };
    });
  }, [transactions, accounts]);

  return {
    accounts,
    transactions,
    executeTransfer,
    getTotalByCurrency,
    // Analytics functions
    getAnalyticsData,
    getAccountPerformance,
    getCurrencyAnalytics,
    getRiskMetrics,
    getTransactionVolume,
    // Computed analytics
    recentAnalytics,
    dashboardMetrics,
    // Helper functions
    getTopPerformingAccounts,
    getLowBalanceAccounts,
    getRecentTransactions,
    getTransactionsByAccount
  };
};