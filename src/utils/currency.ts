import { Currency, ExchangeRate } from '../types';
import { EXCHANGE_RATES, CURRENCIES } from '../data/constants';

export const formatCurrency = (amount: number, currency: Currency): string => {
  const { symbol } = CURRENCIES[currency];
  return `${symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const getExchangeRate = (from: Currency, to: Currency): number => {
  if (from === to) return 1;
  
  const rate = EXCHANGE_RATES.find(r => r.from === from && r.to === to);
  return rate?.rate || 1;
};

export const convertCurrency = (amount: number, from: Currency, to: Currency): number => {
  const rate = getExchangeRate(from, to);
  return amount * rate;
};

export const getCurrencyColor = (currency: Currency): string => {
  const colorMap = {
    'KES': 'blue',
    'USD': 'green', 
    'NGN': 'orange'
  };
  return colorMap[currency];
};

export const getCurrencyBadgeClasses = (currency: Currency): string => {
  const baseClasses = 'px-2 py-1 rounded-full text-xs font-semibold';
  const colorMap = {
    'KES': 'bg-blue-100 text-blue-800',
    'USD': 'bg-green-100 text-green-800',
    'NGN': 'bg-orange-100 text-orange-800'
  };
  return `${baseClasses} ${colorMap[currency]}`;
};