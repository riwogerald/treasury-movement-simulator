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
}