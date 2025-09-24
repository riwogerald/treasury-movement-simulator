import React, { useState, useMemo } from 'react';
import { Transaction, Account, FilterOptions, Currency, TransactionStatus } from '../types';
import { formatCurrency } from '../utils/currency';
import { ArrowRight, Filter, Search, Calendar, X, RefreshCw } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
  accounts: Account[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, accounts }) => {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const getAccountName = (accountId: string) => {
    return accounts.find(a => a.id === accountId)?.name || 'Unknown Account';
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Currency filter
      if (filters.currency && transaction.currency !== filters.currency) {
        return false;
      }

      // Account filter
      if (filters.accountId && 
          transaction.fromAccountId !== filters.accountId && 
          transaction.toAccountId !== filters.accountId) {
        return false;
      }

      // Status filter
      if (filters.status && transaction.status !== filters.status) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom) {
        const transactionDate = new Date(transaction.timestamp);
        const filterDate = new Date(filters.dateFrom);
        if (transactionDate < filterDate) return false;
      }

      if (filters.dateTo) {
        const transactionDate = new Date(transaction.timestamp);
        const filterDate = new Date(filters.dateTo);
        filterDate.setHours(23, 59, 59); // End of day
        if (transactionDate > filterDate) return false;
      }

      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const fromAccountName = getAccountName(transaction.fromAccountId).toLowerCase();
        const toAccountName = getAccountName(transaction.toAccountId).toLowerCase();
        const note = transaction.note?.toLowerCase() || '';
        const transactionId = transaction.id.toLowerCase();
        const amountString = transaction.amount.toString();
        
        if (!fromAccountName.includes(searchLower) && 
            !toAccountName.includes(searchLower) && 
            !note.includes(searchLower) &&
            !transactionId.includes(searchLower) &&
            !amountString.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, filters, searchTerm, accounts]);

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const setQuickDateFilter = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    setFilters({
      ...filters,
      dateFrom: startDate.toISOString().split('T')[0],
      dateTo: endDate.toISOString().split('T')[0]
    });
  };

  const getStatusBadge = (status: string, scheduledDate?: Date) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    
    switch (status) {
      case 'completed':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Completed</span>;
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
      case 'scheduled':
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            Scheduled {scheduledDate && `(${scheduledDate.toLocaleDateString()})`}
          </span>
        );
      case 'failed':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Failed</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by account, note, amount, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64"
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {isFilterOpen && (
          <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: (e.target.value as TransactionStatus) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={filters.currency || ''}
                onChange={(e) => setFilters({ ...filters, currency: (e.target.value as Currency) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Currencies</option>
                <option value="KES">KES</option>
                <option value="USD">USD</option>
                <option value="NGN">NGN</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
              <select
                value={filters.accountId || ''}
                onChange={(e) => setFilters({ ...filters, accountId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Accounts</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-5 flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                <span>Clear Filters</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-sm font-medium text-gray-700 mr-2">Quick filters:</span>
          <button
            onClick={() => setQuickDateFilter(7)}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
          >
            Last 7 days
          </button>
          <button
            onClick={() => setQuickDateFilter(30)}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
          >
            Last 30 days
          </button>
          <button
            onClick={() => setQuickDateFilter(90)}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
          >
            Last 3 months
          </button>
          <button
            onClick={() => setFilters({ ...filters, status: 'pending' })}
            className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
          >
            Pending only
          </button>
          <button
            onClick={() => setFilters({ ...filters, status: 'completed' })}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
          >
            Completed only
          </button>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </p>
          {(Object.keys(filters).length > 0 || searchTerm) && (
            <div className="flex items-center text-sm text-gray-500">
              <RefreshCw className="w-4 h-4 mr-1" />
              <span>Filters active</span>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">
                          {getAccountName(transaction.fromAccountId)}
                        </span>
                        <ArrowRight className="w-4 h-4 mx-2 inline text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {getAccountName(transaction.toAccountId)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </div>
                      {transaction.convertedAmount && transaction.convertedCurrency && (
                        <div className="text-sm text-gray-600">
                          → {formatCurrency(transaction.convertedAmount, transaction.convertedCurrency)}
                        </div>
                      )}
                    </div>
                    {getStatusBadge(transaction.status, transaction.scheduledDate)}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                  <div>
                    {transaction.note && (
                      <p className="italic">"{transaction.note}"</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    {transaction.exchangeRate && (
                      <span>Rate: {transaction.exchangeRate.toFixed(4)}</span>
                    )}
                    <span>{transaction.timestamp.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;