import { Account, Currency, ExchangeRate } from '../types';

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