import React, { useState, useMemo } from 'react';
import { 
  Account, 
  Transaction, 
  Currency, 
  DateRange, 
  AnalyticsData,
  KPIMetric,
  LineChartData,
  BarChartData,
  PieChartData,
  AreaChartData
} from '../types';
import { 
  generateAnalyticsData, 
  getDateRange, 
  calculateTransactionVolume,
  formatDate 
} from '../utils/analytics';
import { LineChart, BarChart, PieChart, DonutChart, AreaChart } from './Charts';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  DollarSign, 
  Activity, 
  Users, 
  AlertTriangle,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';

interface AnalyticsDashboardProps {
  accounts: Account[];
  transactions: Transaction[];
}

// KPI Card Component
interface KPICardProps {
  metric: KPIMetric;
}

const KPICard: React.FC<KPICardProps> = ({ metric }) => {
  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (metric.trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const formatValue = (value: string | number) => {
    if (typeof value === 'string') return value;
    
    switch (metric.format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{metric.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatValue(metric.value)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {getTrendIcon()}
          {metric.change !== undefined && (
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Date Range Selector Component
interface DateRangeSelectorProps {
  selectedRange: string;
  onRangeChange: (range: string) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ selectedRange, onRangeChange }) => {
  const ranges = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' }
  ];

  return (
    <div className="flex items-center space-x-2">
      <Calendar className="w-4 h-4 text-gray-500" />
      <select
        value={selectedRange}
        onChange={(e) => onRangeChange(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {ranges.map(range => (
          <option key={range.value} value={range.value}>
            {range.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Currency Filter Component
interface CurrencyFilterProps {
  selectedCurrency: Currency | 'all';
  onCurrencyChange: (currency: Currency | 'all') => void;
}

const CurrencyFilter: React.FC<CurrencyFilterProps> = ({ selectedCurrency, onCurrencyChange }) => {
  const currencies = [
    { value: 'all', label: 'All Currencies' },
    { value: 'USD', label: 'USD' },
    { value: 'KES', label: 'KES' },
    { value: 'NGN', label: 'NGN' }
  ];

  return (
    <div className="flex items-center space-x-2">
      <Filter className="w-4 h-4 text-gray-500" />
      <select
        value={selectedCurrency}
        onChange={(e) => onCurrencyChange(e.target.value as Currency | 'all')}
        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {currencies.map(currency => (
          <option key={currency.value} value={currency.value}>
            {currency.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  accounts, 
  transactions 
}) => {
  const [dateRange, setDateRange] = useState('30');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | 'all'>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const currentRange = getDateRange(parseInt(dateRange));
    const previousRange = {
      start: new Date(currentRange.start.getTime() - (currentRange.end.getTime() - currentRange.start.getTime())),
      end: currentRange.start
    };
    
    return generateAnalyticsData(accounts, transactions, currentRange, previousRange);
  }, [accounts, transactions, dateRange, refreshKey]);

  // Generate KPI metrics
  const kpiMetrics = useMemo((): KPIMetric[] => {
    const { summary, trends } = analyticsData;
    
    return [
      {
        label: 'Total Transaction Volume',
        value: summary.totalTransactionVolume,
        change: summary.previousPeriodComparison?.volumeChange,
        trend: trends.volumeTrend,
        format: 'currency'
      },
      {
        label: 'Transaction Count',
        value: summary.totalTransactionCount,
        change: summary.previousPeriodComparison?.countChange,
        trend: trends.transactionTrend,
        format: 'number'
      },
      {
        label: 'Active Accounts',
        value: summary.activeAccountsCount,
        trend: 'stable',
        format: 'number'
      },
      {
        label: 'Average Transaction',
        value: summary.averageTransactionSize,
        trend: 'stable',
        format: 'currency'
      }
    ];
  }, [analyticsData]);

  // Generate chart data
  const transactionVolumeChartData = useMemo((): LineChartData => {
    const volumeData = analyticsData.transactionVolume;
    
    return {
      datasets: [{
        label: 'Transaction Volume',
        data: volumeData.map(item => ({
          x: item.date,
          y: item.volume
        })),
        color: '#3b82f6'
      }]
    };
  }, [analyticsData]);

  const accountPerformanceChartData = useMemo((): BarChartData => {
    const performanceData = analyticsData.accountPerformance
      .slice(0, 8) // Show top 8 accounts
      .sort((a, b) => Math.abs(b.netFlow) - Math.abs(a.netFlow));
    
    return {
      categories: performanceData.map(item => item.accountName),
      datasets: [
        {
          label: 'Net Flow',
          data: performanceData.map(item => Math.abs(item.netFlow)),
          color: '#10b981'
        }
      ]
    };
  }, [analyticsData]);

  const currencyDistributionChartData = useMemo((): PieChartData => {
    const currencyData = analyticsData.currencyAnalytics;
    const total = currencyData.reduce((sum, item) => sum + item.totalTransactionVolume, 0);
    
    const colors = {
      USD: '#3b82f6',
      KES: '#10b981', 
      NGN: '#f59e0b'
    };
    
    return {
      segments: currencyData.map(item => ({
        label: item.currency,
        value: item.totalTransactionVolume,
        color: colors[item.currency],
        percentage: total > 0 ? (item.totalTransactionVolume / total) * 100 : 0
      }))
    };
  }, [analyticsData]);

  const transactionCountChartData = useMemo((): AreaChartData => {
    const volumeData = analyticsData.transactionVolume;
    
    return {
      datasets: [{
        label: 'Transaction Count',
        data: volumeData.map(item => ({
          x: item.date,
          y: item.count
        })),
        color: '#8b5cf6',
        fillColor: '#8b5cf650'
      }]
    };
  }, [analyticsData]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="flex items-center space-x-4">
          <DateRangeSelector 
            selectedRange={dateRange}
            onRangeChange={setDateRange}
          />
          <CurrencyFilter 
            selectedCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
          />
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiMetrics.map((metric, index) => (
          <KPICard key={index} metric={metric} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Volume Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <LineChart 
            data={transactionVolumeChartData}
            title="Transaction Volume Over Time"
            height={300}
          />
        </div>

        {/* Currency Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <DonutChart 
            data={currencyDistributionChartData}
            title="Currency Distribution"
            centerLabel="Total Volume"
            centerValue={`$${(analyticsData.summary.totalTransactionVolume / 1000).toFixed(0)}K`}
            height={300}
          />
        </div>

        {/* Account Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <BarChart 
            data={accountPerformanceChartData}
            title="Top Account Performance (Net Flow)"
            height={300}
          />
        </div>

        {/* Transaction Count Over Time */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <AreaChart 
            data={transactionCountChartData}
            title="Transaction Count Trend"
            height={300}
          />
        </div>
      </div>

      {/* Risk Assessment & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
            Risk Assessment
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Overall Risk Level</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(analyticsData.riskMetrics.riskLevel)}`}>
                {analyticsData.riskMetrics.riskLevel.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Liquidity Risk</span>
                <span>{analyticsData.riskMetrics.liquidityRisk.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${analyticsData.riskMetrics.liquidityRisk}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Concentration Risk</span>
                <span>{analyticsData.riskMetrics.concentrationRisk.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ width: `${analyticsData.riskMetrics.concentrationRisk}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Volatility Risk</span>
                <span>{analyticsData.riskMetrics.volatilityRisk.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ width: `${analyticsData.riskMetrics.volatilityRisk}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            Key Insights
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Most Active Account</p>
                <p className="text-sm text-gray-600">{analyticsData.summary.mostActiveAccount}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <DollarSign className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Primary Currency</p>
                <p className="text-sm text-gray-600">{analyticsData.summary.mostUsedCurrency}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-5 h-5 text-purple-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Largest Transaction</p>
                <p className="text-sm text-gray-600">
                  ${analyticsData.summary.largestTransaction.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {analyticsData.riskMetrics.recommendations.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {analyticsData.riskMetrics.recommendations.slice(0, 3).map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {analyticsData.currencyAnalytics.reduce((sum, curr) => sum + curr.transactionCount, 0)}
            </p>
            <p className="text-sm text-gray-600">Total Transactions</p>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-green-600">
              {analyticsData.accountPerformance.filter(acc => acc.performance === 'high').length}
            </p>
            <p className="text-sm text-gray-600">High Performing Accounts</p>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-orange-600">
              {analyticsData.riskMetrics.lowBalanceAccounts.length}
            </p>
            <p className="text-sm text-gray-600">Low Balance Accounts</p>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-purple-600">
              ${(analyticsData.summary.averageTransactionSize).toFixed(0)}
            </p>
            <p className="text-sm text-gray-600">Avg Transaction Size</p>
          </div>
        </div>
      </div>
    </div>
  );
};
