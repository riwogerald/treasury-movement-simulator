import { describe, it, expect } from 'vitest';
import { validateTransfer, validateAmount } from '../validation';
import { Account, TransferFormData } from '../../types';

describe('Validation Utils', () => {
  const mockAccounts: Account[] = [
    {
      id: '1',
      name: 'Test Account 1',
      currency: 'USD',
      balance: 1000,
      type: 'Bank',
      isActive: true
    },
    {
      id: '2',
      name: 'Test Account 2',
      currency: 'KES',
      balance: 50000,
      type: 'Mpesa',
      isActive: true
    },
    {
      id: '3',
      name: 'Inactive Account',
      currency: 'USD',
      balance: 500,
      type: 'Bank',
      isActive: false
    }
  ];

  describe('validateTransfer', () => {
    it('should validate a correct transfer', () => {
      const formData: TransferFormData = {
        fromAccountId: '1',
        toAccountId: '2',
        amount: 500,
        note: 'Test transfer'
      };

      const result = validateTransfer(formData, mockAccounts);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject transfer with non-existent source account', () => {
      const formData: TransferFormData = {
        fromAccountId: 'invalid',
        toAccountId: '2',
        amount: 500
      };

      const result = validateTransfer(formData, mockAccounts);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Source account not found');
    });

    it('should reject transfer with non-existent destination account', () => {
      const formData: TransferFormData = {
        fromAccountId: '1',
        toAccountId: 'invalid',
        amount: 500
      };

      const result = validateTransfer(formData, mockAccounts);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Destination account not found');
    });

    it('should reject self-transfer', () => {
      const formData: TransferFormData = {
        fromAccountId: '1',
        toAccountId: '1',
        amount: 500
      };

      const result = validateTransfer(formData, mockAccounts);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cannot transfer to the same account');
    });

    it('should reject transfer with zero amount', () => {
      const formData: TransferFormData = {
        fromAccountId: '1',
        toAccountId: '2',
        amount: 0
      };

      const result = validateTransfer(formData, mockAccounts);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Amount must be greater than zero');
    });

    it('should reject transfer with negative amount', () => {
      const formData: TransferFormData = {
        fromAccountId: '1',
        toAccountId: '2',
        amount: -100
      };

      const result = validateTransfer(formData, mockAccounts);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Amount must be greater than zero');
    });

    it('should reject transfer with insufficient funds', () => {
      const formData: TransferFormData = {
        fromAccountId: '1',
        toAccountId: '2',
        amount: 1500 // Account 1 only has 1000
      };

      const result = validateTransfer(formData, mockAccounts);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Insufficient funds in source account');
    });

    it('should reject transfer scheduled in the past', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const formData: TransferFormData = {
        fromAccountId: '1',
        toAccountId: '2',
        amount: 500,
        scheduledDate: pastDate.toISOString()
      };

      const result = validateTransfer(formData, mockAccounts);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Scheduled date must be in the future');
    });

    it('should accept transfer scheduled in the future', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const formData: TransferFormData = {
        fromAccountId: '1',
        toAccountId: '2',
        amount: 500,
        scheduledDate: futureDate.toISOString()
      };

      const result = validateTransfer(formData, mockAccounts);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accumulate multiple errors', () => {
      const formData: TransferFormData = {
        fromAccountId: '1',
        toAccountId: '1', // Same account
        amount: 0 // Zero amount
      };

      const result = validateTransfer(formData, mockAccounts);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain('Cannot transfer to the same account');
      expect(result.errors).toContain('Amount must be greater than zero');
    });
  });

  describe('validateAmount', () => {
    it('should validate positive numbers', () => {
      expect(validateAmount('100')).toBe(true);
      expect(validateAmount('0.01')).toBe(true);
      expect(validateAmount('999999999')).toBe(true);
    });

    it('should reject zero and negative numbers', () => {
      expect(validateAmount('0')).toBe(false);
      expect(validateAmount('-100')).toBe(false);
    });

    it('should reject non-numeric strings', () => {
      expect(validateAmount('abc')).toBe(false);
      expect(validateAmount('')).toBe(false);
      expect(validateAmount('100abc')).toBe(false);
    });

    it('should reject amounts that are too large', () => {
      expect(validateAmount('1000000000')).toBe(false);
    });

    it('should handle decimal numbers', () => {
      expect(validateAmount('100.50')).toBe(true);
      expect(validateAmount('0.99')).toBe(true);
    });
  });
});