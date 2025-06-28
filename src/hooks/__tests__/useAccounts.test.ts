import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAccounts } from '../useAccounts';
import { TransferFormData } from '../../types';

describe('useAccounts Hook', () => {
  let hook: ReturnType<typeof renderHook<ReturnType<typeof useAccounts>, unknown>>;

  beforeEach(() => {
    hook = renderHook(() => useAccounts());
  });

  it('should initialize with default accounts', () => {
    expect(hook.result.current.accounts).toHaveLength(10);
    expect(hook.result.current.transactions).toHaveLength(0);
  });

  it('should have accounts with correct currencies', () => {
    const { accounts } = hook.result.current;
    const currencies = accounts.map(acc => acc.currency);
    
    expect(currencies).toContain('KES');
    expect(currencies).toContain('USD');
    expect(currencies).toContain('NGN');
  });

  it('should calculate total by currency correctly', () => {
    const { getTotalByurrency, accounts } = hook.result.current;
    
    const kesTotal = accounts
      .filter(acc => acc.currency === 'KES')
      .reduce((sum, acc) => sum + acc.balance, 0);
    
    expect(getTotalByurrency('KES')).toBe(kesTotal);
  });

  it('should execute a valid same-currency transfer', () => {
    const { accounts } = hook.result.current;
    const fromAccount = accounts.find(acc => acc.currency === 'USD' && acc.balance > 1000);
    const toAccount = accounts.find(acc => acc.currency === 'USD' && acc.id !== fromAccount?.id);

    if (!fromAccount || !toAccount) {
      throw new Error('Could not find suitable accounts for test');
    }

    const initialFromBalance = fromAccount.balance;
    const initialToBalance = toAccount.balance;
    const transferAmount = 500;

    const transferData: TransferFormData = {
      fromAccountId: fromAccount.id,
      toAccountId: toAccount.id,
      amount: transferAmount,
      note: 'Test transfer'
    };

    act(() => {
      const success = hook.result.current.executeTransfer(transferData);
      expect(success).toBe(true);
    });

    const { accounts: updatedAccounts, transactions } = hook.result.current;
    const updatedFromAccount = updatedAccounts.find(acc => acc.id === fromAccount.id);
    const updatedToAccount = updatedAccounts.find(acc => acc.id === toAccount.id);

    expect(updatedFromAccount?.balance).toBe(initialFromBalance - transferAmount);
    expect(updatedToAccount?.balance).toBe(initialToBalance + transferAmount);
    expect(transactions).toHaveLength(1);
    expect(transactions[0].amount).toBe(transferAmount);
    expect(transactions[0].status).toBe('completed');
  });

  it('should execute a cross-currency transfer with conversion', () => {
    const { accounts } = hook.result.current;
    const fromAccount = accounts.find(acc => acc.currency === 'USD' && acc.balance > 100);
    const toAccount = accounts.find(acc => acc.currency === 'KES');

    if (!fromAccount || !toAccount) {
      throw new Error('Could not find suitable accounts for test');
    }

    const initialFromBalance = fromAccount.balance;
    const initialToBalance = toAccount.balance;
    const transferAmount = 100;
    const expectedConvertedAmount = transferAmount * 132.50; // USD to KES rate

    const transferData: TransferFormData = {
      fromAccountId: fromAccount.id,
      toAccountId: toAccount.id,
      amount: transferAmount,
      note: 'Cross-currency test'
    };

    act(() => {
      const success = hook.result.current.executeTransfer(transferData);
      expect(success).toBe(true);
    });

    const { accounts: updatedAccounts, transactions } = hook.result.current;
    const updatedFromAccount = updatedAccounts.find(acc => acc.id === fromAccount.id);
    const updatedToAccount = updatedAccounts.find(acc => acc.id === toAccount.id);

    expect(updatedFromAccount?.balance).toBe(initialFromBalance - transferAmount);
    expect(updatedToAccount?.balance).toBe(initialToBalance + expectedConvertedAmount);
    expect(transactions).toHaveLength(1);
    expect(transactions[0].convertedAmount).toBe(expectedConvertedAmount);
    expect(transactions[0].convertedCurrency).toBe('KES');
    expect(transactions[0].exchangeRate).toBe(132.50);
  });

  it('should reject transfer with insufficient funds', () => {
    const { accounts } = hook.result.current;
    const fromAccount = accounts[0];
    const toAccount = accounts[1];

    const transferData: TransferFormData = {
      fromAccountId: fromAccount.id,
      toAccountId: toAccount.id,
      amount: fromAccount.balance + 1000, // More than available
      note: 'Invalid transfer'
    };

    act(() => {
      const success = hook.result.current.executeTransfer(transferData);
      expect(success).toBe(false);
    });

    expect(hook.result.current.transactions).toHaveLength(0);
  });

  it('should create scheduled transfer', () => {
    const { accounts } = hook.result.current;
    const fromAccount = accounts.find(acc => acc.balance > 500);
    const toAccount = accounts.find(acc => acc.id !== fromAccount?.id);

    if (!fromAccount || !toAccount) {
      throw new Error('Could not find suitable accounts for test');
    }

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const transferData: TransferFormData = {
      fromAccountId: fromAccount.id,
      toAccountId: toAccount.id,
      amount: 500,
      scheduledDate: futureDate.toISOString()
    };

    act(() => {
      const success = hook.result.current.executeTransfer(transferData);
      expect(success).toBe(true);
    });

    const { transactions } = hook.result.current;
    expect(transactions).toHaveLength(1);
    expect(transactions[0].status).toBe('scheduled');
    expect(transactions[0].scheduledDate).toEqual(futureDate);
  });

  it('should maintain transaction order (newest first)', () => {
    const { accounts } = hook.result.current;
    const fromAccount = accounts.find(acc => acc.balance > 1000);
    const toAccount = accounts.find(acc => acc.id !== fromAccount?.id);

    if (!fromAccount || !toAccount) {
      throw new Error('Could not find suitable accounts for test');
    }

    // Execute multiple transfers
    act(() => {
      hook.result.current.executeTransfer({
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        amount: 100,
        note: 'First transfer'
      });
    });

    act(() => {
      hook.result.current.executeTransfer({
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        amount: 200,
        note: 'Second transfer'
      });
    });

    const { transactions } = hook.result.current;
    expect(transactions).toHaveLength(2);
    expect(transactions[0].note).toBe('Second transfer'); // Newest first
    expect(transactions[1].note).toBe('First transfer');
  });
});