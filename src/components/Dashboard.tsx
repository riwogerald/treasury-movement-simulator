import React from 'react';
import { Account, Transaction, Currency } from '../types';
import { formatCurrency } from '../utils/currency';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, TestTube } from 'lucide-react';
import TestScenarioRunner from './TestScenarioRunner';

interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
  getTotalByCurrency: (currency: Currency) => number;
  executeTransfer?: (formData: any) => boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ accounts, transactions, getTotalByCurrency, executeTransfer }) => {
  const currencies: Currency[] = ['KES', 'USD', 'NGN'];
  
  const getRecentTransactions = (limit: number = 5) => {
    return transactions
      .filter(t => t.status === 'completed')
      .slice(0, limit);
  };

  const getTotalAccounts = () => accounts.filter(a => a.isActive).length;
  
  const getTodaysTransactions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return transactions.filter(t => {
      const transactionDate = new Date(t.timestamp);
      transactionDate.setHours(0, 0, 0, 0);
      return transactionDate.getTime() === today.getTime();
    }).length;
  };

  const getAccountName = (accountId: string) => {
    return accounts.find(a => a.id === accountId)?.name || 'Unknown';
  };

  const getTransactionStats = () => {
    const completed = transactions.filter(t => t.status === 'completed').length;
    const pending = transactions.filter(t => t.status === 'pending').length;
    const scheduled = transactions.filter(t => t.status === 'scheduled').length;
    const failed = transactions.filter(t => t.status === 'failed').length;
    
    return { completed, pending, scheduled, failed };
  };

  const stats = getTransactionStats();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Accounts</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalAccounts()}</p>
              <p className="text-xs text-gray-500 mt-1">{accounts.length - getTotalAccounts()} inactive</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.completed} completed</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Transfers</p>
              <p className="text-2xl font-bold text-gray-900">{getTodaysTransactions()}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.pending} pending</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <ArrowUpRight className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
              <p className="text-xs text-red-500 mt-1">{stats.failed} failed</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currency Totals */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Balances by Currency</h3>
          <div className="space-y-4">
            {currencies.map(currency => {
              const total = getTotalByCurrency(currency);
              const accountCount = accounts.filter(a => a.currency === currency && a.isActive).length;
              const inactiveCount = accounts.filter(a => a.currency === currency && !a.isActive).length;
              
              return (
                <div key={currency} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-3 h-3 rounded-full
                      ${currency === 'KES' ? 'bg-blue-500' : currency === 'USD' ? 'bg-green-500' : 'bg-orange-500'}
                    `} />
                    <div>
                      <p className="font-semibold text-gray-900">{currency}</p>
                      <p className="text-sm text-gray-600">
                        {accountCount} active{inactiveCount > 0 ? `, ${inactiveCount} inactive` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">
                      {formatCurrency(total, currency)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {getRecentTransactions().length === 0 ? (
              <p className="text-gray-500 text-center py-4">No transactions yet</p>
            ) : (
              getRecentTransactions().map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg">
                      <ArrowUpRight className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {getAccountName(transaction.fromAccountId)} → {getAccountName(transaction.toAccountId)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {transaction.timestamp.toLocaleDateString()} {transaction.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                    {transaction.convertedAmount && transaction.convertedCurrency && (
                      <p className="text-xs text-gray-600">
                        → {formatCurrency(transaction.convertedAmount, transaction.convertedCurrency)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Test Scenario Runner */}
      {executeTransfer && (
        <TestScenarioRunner 
          accounts={accounts} 
          executeTransfer={executeTransfer}
        />
      )}

      {/* Transaction Status Overview */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Status Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-green-700">Completed</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-yellow-700">Pending</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
            <div className="text-sm text-blue-700">Scheduled</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-red-700">Failed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;