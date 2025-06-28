import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { Account, Transaction } from '../../types';

describe('Dashboard Component', () => {
  const mockAccounts: Account[] = [
    {
      id: '1',
      name: 'USD Account 1',
      currency: 'USD',
      balance: 1000,
      type: 'Bank',
      isActive: true
    },
    {
      id: '2',
      name: 'KES Account 1',
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

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      fromAccountId: '1',
      toAccountId: '2',
      amount: 100,
      currency: 'USD',
      convertedAmount: 13250,
      convertedCurrency: 'KES',
      exchangeRate: 132.50,
      timestamp: new Date(),
      status: 'completed'
    },
    {
      id: '2',
      fromAccountId: '2',
      toAccountId: '1',
      amount: 10000,
      currency: 'KES',
      timestamp: new Date(),
      status: 'scheduled'
    }
  ];

  const mockGetTotalByCurrency = (currency: string) => {
    return mockAccounts
      .filter(acc => acc.currency === currency && acc.isActive)
      .reduce((sum, acc) => sum + acc.balance, 0);
  };

  it('should render summary statistics correctly', () => {
    render(
      <Dashboard 
        accounts={mockAccounts}
        transactions={mockTransactions}
        getTotalByCurrency={mockGetTotalByCurrency}
      />
    );

    // Check active accounts count (should be 2, excluding inactive)
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Check total transactions
    expect(screen.getByText('Total Transactions')).toBeInTheDocument();
    
    // Check scheduled transfers
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });

  it('should display currency totals correctly', () => {
    render(
      <Dashboard 
        accounts={mockAccounts}
        transactions={mockTransactions}
        getTotalByCurrency={mockGetTotalByCurrency}
      />
    );

    expect(screen.getByText('Total Balances by Currency')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('KES')).toBeInTheDocument();
    expect(screen.getByText('NGN')).toBeInTheDocument();
  });

  it('should show recent transactions', () => {
    render(
      <Dashboard 
        accounts={mockAccounts}
        transactions={mockTransactions}
        getTotalByCurrency={mockGetTotalByCurrency}
      />
    );

    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    expect(screen.getByText('USD Account 1 → KES Account 1')).toBeInTheDocument();
  });

  it('should display "No transactions yet" when no transactions exist', () => {
    render(
      <Dashboard 
        accounts={mockAccounts}
        transactions={[]}
        getTotalByCurrency={mockGetTotalByCurrency}
      />
    );

    expect(screen.getByText('No transactions yet')).toBeInTheDocument();
  });

  it('should show correct account counts per currency', () => {
    render(
      <Dashboard 
        accounts={mockAccounts}
        transactions={mockTransactions}
        getTotalByCurrency={mockGetTotalByCurrency}
      />
    );

    // USD should show 1 account (excluding inactive)
    const usdSection = screen.getByText('USD').closest('div');
    expect(usdSection).toHaveTextContent('1 accounts');

    // KES should show 1 account
    const kesSection = screen.getByText('KES').closest('div');
    expect(kesSection).toHaveTextContent('1 accounts');
  });

  it('should format currency amounts correctly in totals', () => {
    render(
      <Dashboard 
        accounts={mockAccounts}
        transactions={mockTransactions}
        getTotalByCurrency={mockGetTotalByCurrency}
      />
    );

    expect(screen.getByText('$ 1,000.00')).toBeInTheDocument();
    expect(screen.getByText('KSh 50,000.00')).toBeInTheDocument();
  });
});