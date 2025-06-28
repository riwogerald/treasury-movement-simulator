import { describe, it, expect } from 'vitest';
import { 
  formatCurrency, 
  getExchangeRate, 
  convertCurrency, 
  getCurrencyColor,
  getCurrencyBadgeClasses 
} from '../currency';
import { Currency } from '../../types';

describe('Currency Utils', () => {
  describe('formatCurrency', () => {
    it('should format KES currency correctly', () => {
      expect(formatCurrency(1000, 'KES')).toBe('KSh 1,000.00');
      expect(formatCurrency(1000.5, 'KES')).toBe('KSh 1,000.50');
      expect(formatCurrency(0, 'KES')).toBe('KSh 0.00');
    });

    it('should format USD currency correctly', () => {
      expect(formatCurrency(1000, 'USD')).toBe('$ 1,000.00');
      expect(formatCurrency(1000.99, 'USD')).toBe('$ 1,000.99');
    });

    it('should format NGN currency correctly', () => {
      expect(formatCurrency(1000, 'NGN')).toBe('₦ 1,000.00');
      expect(formatCurrency(1000000, 'NGN')).toBe('₦ 1,000,000.00');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1234567.89, 'USD')).toBe('$ 1,234,567.89');
    });
  });

  describe('getExchangeRate', () => {
    it('should return 1 for same currency conversion', () => {
      expect(getExchangeRate('USD', 'USD')).toBe(1);
      expect(getExchangeRate('KES', 'KES')).toBe(1);
      expect(getExchangeRate('NGN', 'NGN')).toBe(1);
    });

    it('should return correct exchange rates for USD to other currencies', () => {
      expect(getExchangeRate('USD', 'KES')).toBe(132.50);
      expect(getExchangeRate('USD', 'NGN')).toBe(790.25);
    });

    it('should return correct exchange rates for KES conversions', () => {
      expect(getExchangeRate('KES', 'USD')).toBe(0.0075);
      expect(getExchangeRate('KES', 'NGN')).toBe(5.96);
    });

    it('should return correct exchange rates for NGN conversions', () => {
      expect(getExchangeRate('NGN', 'USD')).toBe(0.00127);
      expect(getExchangeRate('NGN', 'KES')).toBe(0.168);
    });

    it('should return 1 for unknown currency pairs', () => {
      expect(getExchangeRate('USD' as Currency, 'EUR' as Currency)).toBe(1);
    });
  });

  describe('convertCurrency', () => {
    it('should convert USD to KES correctly', () => {
      expect(convertCurrency(100, 'USD', 'KES')).toBe(13250);
    });

    it('should convert USD to NGN correctly', () => {
      expect(convertCurrency(100, 'USD', 'NGN')).toBe(79025);
    });

    it('should convert KES to USD correctly', () => {
      expect(convertCurrency(1000, 'KES', 'USD')).toBe(7.5);
    });

    it('should return same amount for same currency', () => {
      expect(convertCurrency(100, 'USD', 'USD')).toBe(100);
    });

    it('should handle decimal amounts', () => {
      expect(convertCurrency(10.5, 'USD', 'KES')).toBe(1391.25);
    });

    it('should handle zero amounts', () => {
      expect(convertCurrency(0, 'USD', 'KES')).toBe(0);
    });
  });

  describe('getCurrencyColor', () => {
    it('should return correct colors for each currency', () => {
      expect(getCurrencyColor('KES')).toBe('blue');
      expect(getCurrencyColor('USD')).toBe('green');
      expect(getCurrencyColor('NGN')).toBe('orange');
    });
  });

  describe('getCurrencyBadgeClasses', () => {
    it('should return correct CSS classes for each currency', () => {
      expect(getCurrencyBadgeClasses('KES')).toContain('bg-blue-100 text-blue-800');
      expect(getCurrencyBadgeClasses('USD')).toContain('bg-green-100 text-green-800');
      expect(getCurrencyBadgeClasses('NGN')).toContain('bg-orange-100 text-orange-800');
    });

    it('should include base classes', () => {
      const classes = getCurrencyBadgeClasses('USD');
      expect(classes).toContain('px-2 py-1 rounded-full text-xs font-semibold');
    });
  });
});