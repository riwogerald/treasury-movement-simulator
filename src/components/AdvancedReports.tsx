import React, { useState } from 'react';
import { Account, Transaction } from '../types';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ReportGenerator } from './ReportGenerator';
import { 
  BarChart3, 
  FileText, 
  TrendingUp, 
  Download,
  Activity,
  DollarSign,
  Users,
  AlertTriangle
} from 'lucide-react';

interface AdvancedReportsProps {
  accounts: Account[];
  transactions: Transaction[];
}

type TabType = 'overview' | 'analytics' | 'reports';

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const AdvancedReports: React.FC<AdvancedReportsProps> = ({
  accounts,
  transactions
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: TabConfig[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Activity,
      description: 'Quick insights and key metrics'
    },
    {
      id: 'analytics',
      label: 'Analytics Dashboard',
      icon: BarChart3,
      description: 'Interactive charts and detailed analysis'
    },
    {
      id: 'reports',
      label: 'Report Generator',
      icon: FileText,
      description: 'Create and export custom reports'
    }
  ];

  // Calculate overview statistics
  const overviewStats = React.useMemo(() => {
    const activeAccounts = accounts.filter(acc => acc.isActive);
    const totalBalance = activeAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const recentTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.timestamp);
      return txDate >= new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
    });
    
    const totalVolume = recentTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    const currencyDistribution = activeAccounts.reduce((acc, account) => {
      acc[account.currency] = (acc[account.currency] || 0) + account.balance;
      return acc;
    }, {} as Record<string, number>);

    const riskIndicators = {
      lowBalanceAccounts: activeAccounts.filter(acc => {
        const thresholds = { USD: 100, KES: 10000, NGN: 50000 };
        return acc.balance < thresholds[acc.currency as keyof typeof thresholds];
      }).length,
      pendingTransactions: transactions.filter(tx => tx.status === 'pending').length,
      failedTransactions: transactions.filter(tx => tx.status === 'failed').length
    };

    return {
      totalBalance,
      activeAccountsCount: activeAccounts.length,
      recentTransactionCount: recentTransactions.length,
      totalVolume,
      currencyDistribution,
      riskIndicators
    };
  }, [accounts, transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Treasury Reports & Analytics</h2>
        <p className="text-blue-100">
          Comprehensive insights and reporting tools for your treasury management system
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(overviewStats.totalBalance)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Accounts</p>
              <p className="text-2xl font-bold text-gray-900">
                {overviewStats.activeAccountsCount}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">30-Day Volume</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(overviewStats.totalVolume)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {overviewStats.recentTransactionCount}
              </p>
              <p className="text-xs text-gray-500">Last 30 days</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Currency Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab('analytics')}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">View Analytics Dashboard</p>
                  <p className="text-sm text-gray-600">Interactive charts and insights</p>
                </div>
              </div>
              <div className="text-gray-400">→</div>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Generate Custom Reports</p>
                  <p className="text-sm text-gray-600">Export detailed analytics</p>
                </div>
              </div>
              <div className="text-gray-400">→</div>
            </button>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Quick Export Options</p>
                  <p className="text-sm text-gray-600">Instant data downloads</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50">
                  CSV
                </button>
                <button className="px-3 py-1 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50">
                  JSON
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Currency Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency Distribution</h3>
          <div className="space-y-4">
            {Object.entries(overviewStats.currencyDistribution).map(([currency, amount]) => {
              const percentage = (amount / overviewStats.totalBalance) * 100;
              return (
                <div key={currency} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{currency}</span>
                    <span className="text-gray-900">{formatCurrency(amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        currency === 'USD' ? 'bg-blue-500' :
                        currency === 'KES' ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Risk Indicators */}
      {(overviewStats.riskIndicators.lowBalanceAccounts > 0 || 
        overviewStats.riskIndicators.pendingTransactions > 0 || 
        overviewStats.riskIndicators.failedTransactions > 0) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-orange-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Attention Required</h3>
              <div className="space-y-2">
                {overviewStats.riskIndicators.lowBalanceAccounts > 0 && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-orange-600">
                      {overviewStats.riskIndicators.lowBalanceAccounts}
                    </span> accounts have low balances
                  </p>
                )}
                {overviewStats.riskIndicators.pendingTransactions > 0 && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-orange-600">
                      {overviewStats.riskIndicators.pendingTransactions}
                    </span> transactions are pending
                  </p>
                )}
                {overviewStats.riskIndicators.failedTransactions > 0 && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-red-600">
                      {overviewStats.riskIndicators.failedTransactions}
                    </span> transactions have failed
                  </p>
                )}
              </div>
              <button
                onClick={() => setActiveTab('analytics')}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View detailed risk analysis →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Highlights */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Interactive Analytics</h4>
            <p className="text-sm text-gray-600">
              Real-time charts, KPIs, and trend analysis with customizable date ranges and filters
            </p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Custom Reports</h4>
            <p className="text-sm text-gray-600">
              Generate detailed reports in multiple formats with flexible filtering options
            </p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 mb-1">Risk Assessment</h4>
            <p className="text-sm text-gray-600">
              Automated risk scoring and recommendations based on your treasury data
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewContent />;
      case 'analytics':
        return <AnalyticsDashboard accounts={accounts} transactions={transactions} />;
      case 'reports':
        return <ReportGenerator accounts={accounts} transactions={transactions} />;
      default:
        return <OverviewContent />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Description */}
      <div className="bg-gray-50 px-4 py-2 rounded-lg">
        <p className="text-sm text-gray-600">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {renderContent()}
      </div>
    </div>
  );
};
