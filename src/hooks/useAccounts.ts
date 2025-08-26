import { useState, useCallback } from 'react';
import { Account, Transaction, TransferFormData, Currency } from '../types';
import { INITIAL_ACCOUNTS } from '../data/constants';
import { convertCurrency } from '../utils/currency';
import { validateTransfer } from '../utils/validation';

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
      .filter(account => account.currency === currency)
      .reduce((total, account) => total + account.balance, 0);
  }, [accounts]);

  return {
    accounts,
    transactions,
    executeTransfer,
    getTotalByCurrency
  };
};