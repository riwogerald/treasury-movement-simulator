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
  { id: '10', name: 'Corporate_NGN_1', currency: 'NGN', balance: 5200000, type: 'Corporate', isActive: true }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_001',
    fromAccountId: '1',
    toAccountId: '2',
    amount: 25000,
    currency: 'KES',
    note: 'Monthly transfer',
    timestamp: new Date('2024-01-25T10:30:00Z'),
    status: 'completed'
  },
  {
    id: 'tx_002',
    fromAccountId: '3',
    toAccountId: '4',
    amount: 5000,
    currency: 'USD',
    note: 'Budget allocation',
    timestamp: new Date('2024-01-24T14:15:00Z'),
    status: 'completed'
  },
  {
    id: 'tx_003',
    fromAccountId: '6',
    toAccountId: '7',
    amount: 500000,
    currency: 'NGN',
    note: 'Operational funds',
    timestamp: new Date('2024-01-23T09:45:00Z'),
    status: 'completed'
  },
  {
    id: 'tx_004',
    fromAccountId: '9',
    toAccountId: '1',
    amount: 2500,
    currency: 'USD',
    convertedAmount: 331250,
    convertedCurrency: 'KES',
    exchangeRate: 132.50,
    note: 'Cross-currency transfer',
    timestamp: new Date('2024-01-22T16:20:00Z'),
    status: 'completed'
  },
  {
    id: 'tx_005',
    fromAccountId: '8',
    toAccountId: '10',
    amount: 100000,
    currency: 'KES',
    convertedAmount: 596000,
    convertedCurrency: 'NGN',
    exchangeRate: 5.96,
    note: 'Regional transfer',
    timestamp: new Date('2024-01-21T11:10:00Z'),
    status: 'completed'
  },
  {
    id: 'tx_006',
    fromAccountId: '4',
    toAccountId: '5',
    amount: 3500,
    currency: 'USD',
    note: 'Internal rebalancing',
    timestamp: new Date('2024-01-20T13:30:00Z'),
    status: 'completed'
  },
  {
    id: 'tx_007',
    fromAccountId: '2',
    toAccountId: '8',
    amount: 75000,
    currency: 'KES',
    note: 'Corporate funding',
    timestamp: new Date('2024-01-19T10:15:00Z'),
    status: 'completed'
  },
  {
    id: 'tx_008',
    fromAccountId: '7',
    toAccountId: '3',
    amount: 750000,
    currency: 'NGN',
    convertedAmount: 952.5,
    convertedCurrency: 'USD',
    exchangeRate: 0.00127,
    note: 'International payment',
    timestamp: new Date('2024-01-18T15:45:00Z'),
    status: 'completed'
  },
  {
    id: 'tx_009',
    fromAccountId: '5',
    toAccountId: '9',
    amount: 1200,
    currency: 'USD',
    note: 'Project funding',
    timestamp: new Date('2024-01-17T12:20:00Z'),
    status: 'completed'
  },
  {
    id: 'tx_010',
    fromAccountId: '10',
    toAccountId: '6',
    amount: 800000,
    currency: 'NGN',
    note: 'Quarterly distribution',
    timestamp: new Date('2024-01-16T09:30:00Z'),
    status: 'completed'
  },
  // Recent transactions for better analytics
  {
    id: 'tx_011',
    fromAccountId: '1',
    toAccountId: '3',
    amount: 15000,
    currency: 'KES',
    convertedAmount: 112.5,
    convertedCurrency: 'USD',
    exchangeRate: 0.0075,
    note: 'Recent cross-currency',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: 'completed'
  },
  {
    id: 'tx_012',
    fromAccountId: '4',
    toAccountId: '7',
    amount: 8000,
    currency: 'USD',
    convertedAmount: 6320000,
    convertedCurrency: 'NGN',
    exchangeRate: 790.25,
    note: 'Emergency transfer',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    status: 'completed'
  },
  {
    id: 'tx_013',
    fromAccountId: '2',
    toAccountId: '5',
    amount: 50000,
    currency: 'KES',
    convertedAmount: 375,
    convertedCurrency: 'USD',
    exchangeRate: 0.0075,
    note: 'Today\'s transfer',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'completed'
  },
  // Pending and scheduled transactions for testing
  {
    id: 'tx_014',
    fromAccountId: '6',
    toAccountId: '8',
    amount: 300000,
    currency: 'NGN',
    convertedAmount: 50400,
    convertedCurrency: 'KES',
    exchangeRate: 0.168,
    note: 'Pending approval',
    timestamp: new Date(),
    status: 'pending'
  },
  {
    id: 'tx_015',
    fromAccountId: '9',
    toAccountId: '10',
    amount: 12000,
    currency: 'USD',
    convertedAmount: 9483000,
    convertedCurrency: 'NGN',
    exchangeRate: 790.25,
    note: 'Scheduled monthly payment',
    timestamp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: 'scheduled',
    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
];
