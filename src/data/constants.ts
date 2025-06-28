import { Account, Currency, ExchangeRate, Transaction } from '../types';

export const CURRENCIES: Record<Currency, { symbol: string; name: string; color: string }> = {
  KES: { symbol: 'KSh', name: 'Kenyan Shilling', color: 'blue' },
  USD: { symbol: '$', name: 'US Dollar', color: 'green' },
  NGN: { symbol: '₦', name: 'Nigerian Naira', color: 'orange' }
};

export const EXCHANGE_RATES: ExchangeRate[] = [
  // USD as base
  { from: 'USD', to: 'KES', rate: 132.50 },
  { from: 'USD', to: 'NGN', rate: 790.25 },
  // KES conversions
  { from: 'KES', to: 'USD', rate: 0.0075 },
  { from: 'KES', to: 'NGN', rate: 5.96 },
  // NGN conversions
  { from: 'NGN', to: 'USD', rate: 0.00127 },
  { from: 'NGN', to: 'KES', rate: 0.168 }
];

export const INITIAL_ACCOUNTS: Account[] = [
  { id: '1', name: 'Mpesa_KES_1', currency: 'KES', balance: 125000, type: 'Mpesa', isActive: true },
  { id: '2', name: 'Mpesa_KES_2', currency: 'KES', balance: 89500, type: 'Mpesa', isActive: true },
  { id: '3', name: 'Bank_USD_1', currency: 'USD', balance: 15750, type: 'Bank', isActive: true },
  { id: '4', name: 'Bank_USD_2', currency: 'USD', balance: 32100, type: 'Bank', isActive: true },
  { id: '5', name: 'Bank_USD_3', currency: 'USD', balance: 8900, type: 'Bank', isActive: true },
  { id: '6', name: 'Wallet_NGN_1', currency: 'NGN', balance: 2450000, type: 'Wallet', isActive: true },
  { id: '7', name: 'Wallet_NGN_2', currency: 'NGN', balance: 1875000, type: 'Wallet', isActive: true },
  { id: '8', name: 'Corporate_KES_1', currency: 'KES', balance: 450000, type: 'Corporate', isActive: true },
  { id: '9', name: 'Corporate_USD_1', currency: 'USD', balance: 67500, type: 'Corporate', isActive: true },
  { id: '10', name: 'Corporate_NGN_1', currency: 'NGN', balance: 5200000, type: 'Corporate', isActive: true },
  { id: '11', name: 'Inactive_Bank_USD', currency: 'USD', balance: 5000, type: 'Bank', isActive: false },
  { id: '12', name: 'Low_Balance_KES', currency: 'KES', balance: 150, type: 'Mpesa', isActive: true },
  { id: '13', name: 'High_Volume_NGN', currency: 'NGN', balance: 15750000, type: 'Corporate', isActive: true },
  { id: '14', name: 'Emergency_Fund_USD', currency: 'USD', balance: 125000, type: 'Bank', isActive: true },
  { id: '15', name: 'Petty_Cash_KES', currency: 'KES', balance: 25000, type: 'Wallet', isActive: true }
];

// Helper function to create dates relative to now
const createDate = (daysAgo: number, hoursAgo: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  return date;
};

const createFutureDate = (daysFromNow: number, hoursFromNow: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(date.getHours() + hoursFromNow);
  return date;
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Recent completed transactions (last 7 days)
  {
    id: 'tx_001',
    fromAccountId: '3', // Bank_USD_1
    toAccountId: '1', // Mpesa_KES_1
    amount: 500,
    currency: 'USD',
    convertedAmount: 66250,
    convertedCurrency: 'KES',
    exchangeRate: 132.50,
    note: 'Monthly salary transfer to local account',
    timestamp: createDate(0, 2), // 2 hours ago
    status: 'completed'
  },
  {
    id: 'tx_002',
    fromAccountId: '9', // Corporate_USD_1
    toAccountId: '6', // Wallet_NGN_1
    amount: 1200,
    currency: 'USD',
    convertedAmount: 948300,
    convertedCurrency: 'NGN',
    exchangeRate: 790.25,
    note: 'Vendor payment for Q4 services',
    timestamp: createDate(0, 5), // 5 hours ago
    status: 'completed'
  },
  {
    id: 'tx_003',
    fromAccountId: '8', // Corporate_KES_1
    toAccountId: '2', // Mpesa_KES_2
    amount: 75000,
    currency: 'KES',
    note: 'Employee bonus distribution',
    timestamp: createDate(1, 3), // Yesterday, 3 hours ago
    status: 'completed'
  },
  {
    id: 'tx_004',
    fromAccountId: '4', // Bank_USD_2
    toAccountId: '7', // Wallet_NGN_2
    amount: 800,
    currency: 'USD',
    convertedAmount: 632200,
    convertedCurrency: 'NGN',
    exchangeRate: 790.25,
    note: 'Investment fund transfer',
    timestamp: createDate(1, 8), // Yesterday, 8 hours ago
    status: 'completed'
  },
  {
    id: 'tx_005',
    fromAccountId: '13', // High_Volume_NGN
    toAccountId: '14', // Emergency_Fund_USD
    amount: 1580500,
    currency: 'NGN',
    convertedAmount: 2007.24,
    convertedCurrency: 'USD',
    exchangeRate: 0.00127,
    note: 'Emergency fund allocation',
    timestamp: createDate(2, 1), // 2 days ago, 1 hour ago
    status: 'completed'
  },
  {
    id: 'tx_006',
    fromAccountId: '1', // Mpesa_KES_1
    toAccountId: '15', // Petty_Cash_KES
    amount: 5000,
    currency: 'KES',
    note: 'Office petty cash replenishment',
    timestamp: createDate(2, 6), // 2 days ago, 6 hours ago
    status: 'completed'
  },
  {
    id: 'tx_007',
    fromAccountId: '6', // Wallet_NGN_1
    toAccountId: '3', // Bank_USD_1
    amount: 395125,
    currency: 'NGN',
    convertedAmount: 502.01,
    convertedCurrency: 'USD',
    exchangeRate: 0.00127,
    note: 'Profit repatriation',
    timestamp: createDate(3, 4), // 3 days ago, 4 hours ago
    status: 'completed'
  },
  {
    id: 'tx_008',
    fromAccountId: '14', // Emergency_Fund_USD
    toAccountId: '8', // Corporate_KES_1
    amount: 2500,
    currency: 'USD',
    convertedAmount: 331250,
    convertedCurrency: 'KES',
    exchangeRate: 132.50,
    note: 'Operational expense coverage',
    timestamp: createDate(4, 2), // 4 days ago, 2 hours ago
    status: 'completed'
  },
  {
    id: 'tx_009',
    fromAccountId: '2', // Mpesa_KES_2
    toAccountId: '7', // Wallet_NGN_2
    amount: 25000,
    currency: 'KES',
    convertedAmount: 149000,
    convertedCurrency: 'NGN',
    exchangeRate: 5.96,
    note: 'Cross-border payment test',
    timestamp: createDate(5, 7), // 5 days ago, 7 hours ago
    status: 'completed'
  },
  {
    id: 'tx_010',
    fromAccountId: '10', // Corporate_NGN_1
    toAccountId: '4', // Bank_USD_2
    amount: 2371750,
    currency: 'NGN',
    convertedAmount: 3012.12,
    convertedCurrency: 'USD',
    exchangeRate: 0.00127,
    note: 'Quarterly dividend payment',
    timestamp: createDate(6, 5), // 6 days ago, 5 hours ago
    status: 'completed'
  },

  // Pending transactions
  {
    id: 'tx_011',
    fromAccountId: '5', // Bank_USD_3
    toAccountId: '1', // Mpesa_KES_1
    amount: 1000,
    currency: 'USD',
    convertedAmount: 132500,
    convertedCurrency: 'KES',
    exchangeRate: 132.50,
    note: 'Pending bank verification',
    timestamp: createDate(0, 1), // 1 hour ago
    status: 'pending'
  },
  {
    id: 'tx_012',
    fromAccountId: '7', // Wallet_NGN_2
    toAccountId: '9', // Corporate_USD_1
    amount: 790250,
    currency: 'NGN',
    convertedAmount: 1004.02,
    convertedCurrency: 'USD',
    exchangeRate: 0.00127,
    note: 'Awaiting compliance approval',
    timestamp: createDate(0, 3), // 3 hours ago
    status: 'pending'
  },

  // Scheduled transactions (future)
  {
    id: 'tx_013',
    fromAccountId: '14', // Emergency_Fund_USD
    toAccountId: '8', // Corporate_KES_1
    amount: 5000,
    currency: 'USD',
    convertedAmount: 662500,
    convertedCurrency: 'KES',
    exchangeRate: 132.50,
    note: 'Monthly operational funding',
    timestamp: createFutureDate(1, 9), // Tomorrow, 9 hours from now
    status: 'scheduled',
    scheduledDate: createFutureDate(1, 9)
  },
  {
    id: 'tx_014',
    fromAccountId: '13', // High_Volume_NGN
    toAccountId: '6', // Wallet_NGN_1
    amount: 3000000,
    currency: 'NGN',
    note: 'Scheduled investment distribution',
    timestamp: createFutureDate(3, 0), // 3 days from now
    status: 'scheduled',
    scheduledDate: createFutureDate(3, 0)
  },
  {
    id: 'tx_015',
    fromAccountId: '4', // Bank_USD_2
    toAccountId: '2', // Mpesa_KES_2
    amount: 750,
    currency: 'USD',
    convertedAmount: 99375,
    convertedCurrency: 'KES',
    exchangeRate: 132.50,
    note: 'Weekly payroll transfer',
    timestamp: createFutureDate(7, 10), // Next week
    status: 'scheduled',
    scheduledDate: createFutureDate(7, 10)
  },

  // Failed transactions (for testing error scenarios)
  {
    id: 'tx_016',
    fromAccountId: '12', // Low_Balance_KES
    toAccountId: '1', // Mpesa_KES_1
    amount: 1000,
    currency: 'KES',
    note: 'Failed due to insufficient funds',
    timestamp: createDate(1, 12), // Yesterday, 12 hours ago
    status: 'failed'
  },
  {
    id: 'tx_017',
    fromAccountId: '11', // Inactive_Bank_USD
    toAccountId: '3', // Bank_USD_1
    amount: 500,
    currency: 'USD',
    note: 'Failed due to inactive account',
    timestamp: createDate(2, 8), // 2 days ago, 8 hours ago
    status: 'failed'
  },

  // High-frequency trading simulation
  {
    id: 'tx_018',
    fromAccountId: '9', // Corporate_USD_1
    toAccountId: '10', // Corporate_NGN_1
    amount: 100,
    currency: 'USD',
    convertedAmount: 79025,
    convertedCurrency: 'NGN',
    exchangeRate: 790.25,
    note: 'Automated trading bot transaction #1',
    timestamp: createDate(0, 0.5), // 30 minutes ago
    status: 'completed'
  },
  {
    id: 'tx_019',
    fromAccountId: '10', // Corporate_NGN_1
    toAccountId: '9', // Corporate_USD_1
    amount: 79025,
    currency: 'NGN',
    convertedAmount: 100.40,
    convertedCurrency: 'USD',
    exchangeRate: 0.00127,
    note: 'Automated trading bot transaction #2',
    timestamp: createDate(0, 0.3), // 18 minutes ago
    status: 'completed'
  },
  {
    id: 'tx_020',
    fromAccountId: '3', // Bank_USD_1
    toAccountId: '8', // Corporate_KES_1
    amount: 250,
    currency: 'USD',
    convertedAmount: 33125,
    convertedCurrency: 'KES',
    exchangeRate: 132.50,
    note: 'Micro-investment transfer',
    timestamp: createDate(0, 0.1), // 6 minutes ago
    status: 'completed'
  }
];

// Test scenarios for different use cases
export const TEST_SCENARIOS = {
  // Large volume transfers
  LARGE_VOLUME: {
    description: 'High-value corporate transfers',
    accounts: ['9', '10', '13', '14'],
    typical_amounts: [50000, 100000, 250000]
  },
  
  // Cross-currency arbitrage
  ARBITRAGE: {
    description: 'Currency exchange optimization',
    pairs: [
      { from: 'USD', to: 'KES', accounts: ['3', '1'] },
      { from: 'KES', to: 'NGN', accounts: ['1', '6'] },
      { from: 'NGN', to: 'USD', accounts: ['6', '3'] }
    ]
  },
  
  // Micro-transactions
  MICRO_PAYMENTS: {
    description: 'Small frequent payments',
    accounts: ['12', '15'],
    typical_amounts: [10, 25, 50, 100]
  },
  
  // Emergency scenarios
  EMERGENCY: {
    description: 'Emergency fund activations',
    source_account: '14', // Emergency_Fund_USD
    target_accounts: ['1', '2', '8', '15'],
    typical_amounts: [1000, 2500, 5000]
  },
  
  // Payroll simulation
  PAYROLL: {
    description: 'Employee salary distributions',
    source_accounts: ['8', '9', '10'], // Corporate accounts
    target_accounts: ['1', '2', '6', '7'], // Employee accounts
    schedule: 'weekly'
  }
};

// Performance benchmarks for testing
export const PERFORMANCE_BENCHMARKS = {
  TRANSACTION_VOLUME: {
    low: 10,
    medium: 100,
    high: 1000,
    extreme: 10000
  },
  
  CONCURRENT_USERS: {
    single: 1,
    small_team: 5,
    department: 25,
    enterprise: 100
  },
  
  DATA_RETENTION: {
    days: 90,
    max_transactions: 50000
  }
};