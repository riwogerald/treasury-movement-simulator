import React, { useState, useMemo } from 'react';
import { 
  Account, 
  Transaction, 
  Currency,
  ReportType,
  ExportFormat,
  ReportConfig,
  ReportData
} from '../types';
import { 
  generateReportData,
  getDateRange,
  exportToCsv,
  exportToJson,
  generateAnalyticsData
} from '../utils/analytics';
import { 
  Download, 
  FileText, 
  Calendar,
  Filter,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Users
} from 'lucide-react';

interface ReportGeneratorProps {
  accounts: Account[];
  transactions: Transaction[];
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ 
  accounts, 
  transactions 
}) => {
  const [reportType, setReportType] = useState<ReportType>('summary');
  const [dateRange, setDateRange] = useState('30');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | 'all'>('all');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate current report data
  const reportData = useMemo((): ReportData => {
    const range = getDateRange(parseInt(dateRange));
    
    const config: ReportConfig = {
      type: reportType,
      dateRange: range,
      currency: selectedCurrency !== 'all' ? selectedCurrency : undefined,
      accountIds: selectedAccounts.length > 0 ? selectedAccounts : undefined,
      includeCharts,
      format: exportFormat,
      title: getReportTitle(reportType),
      description: getReportDescription(reportType, range)
    };

    return generateReportData(config, accounts, transactions);
  }, [reportType, dateRange, selectedCurrency, selectedAccounts, includeCharts, exportFormat, accounts, transactions]);

  const reportTypes = [
    { value: 'summary' as ReportType, label: 'Summary Report', icon: FileText },
    { value: 'detailed' as ReportType, label: 'Detailed Report', icon: BarChart3 },
    { value: 'analytics' as ReportType, label: 'Analytics Report', icon: PieChart },
    { value: 'risk' as ReportType, label: 'Risk Assessment', icon: AlertTriangle },
    { value: 'performance' as ReportType, label: 'Performance Report', icon: TrendingUp },
    { value: 'transactions' as ReportType, label: 'Transaction Report', icon: DollarSign }
  ];

  const dateRanges = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' }
  ];

  const exportFormats = [
    { value: 'json' as ExportFormat, label: 'JSON' },
    { value: 'csv' as ExportFormat, label: 'CSV' }
  ];

  function getReportTitle(type: ReportType): string {
    const titles = {
      summary: 'Treasury Summary Report',
      detailed: 'Detailed Treasury Analysis',
      analytics: 'Treasury Analytics Report',
      risk: 'Risk Assessment Report',
      performance: 'Account Performance Report',
      transactions: 'Transaction History Report'
    };
    return titles[type];
  }

  function getReportDescription(type: ReportType, range: { start: Date; end: Date }): string {
    const period = `${range.start.toLocaleDateString()} to ${range.end.toLocaleDateString()}`;
    const descriptions = {
      summary: `Comprehensive overview of treasury operations for the period ${period}`,
      detailed: `In-depth analysis of all treasury activities from ${period}`,
      analytics: `Statistical analysis and insights for treasury operations (${period})`,
      risk: `Risk assessment and recommendations based on data from ${period}`,
      performance: `Account performance metrics and comparisons for ${period}`,
      transactions: `Complete transaction history and details for ${period}`
    };
    return descriptions[type];
  }

  const generateReportContent = (data: ReportData) => {
    const { analytics, config, generatedAt, metadata } = data;

    switch (config.type) {
      case 'summary':
        return {
          report_info: {
            title: config.title,
            description: config.description,
            generated_at: generatedAt.toISOString(),
            period: {
              start: config.dateRange.start.toISOString(),
              end: config.dateRange.end.toISOString()
            }
          },
          summary_metrics: {
            total_transaction_volume: analytics.summary.totalTransactionVolume,
            total_transaction_count: analytics.summary.totalTransactionCount,
            active_accounts: analytics.summary.activeAccountsCount,
            average_transaction_size: analytics.summary.averageTransactionSize,
            largest_transaction: analytics.summary.largestTransaction,
            most_active_account: analytics.summary.mostActiveAccount,
            primary_currency: analytics.summary.mostUsedCurrency
          },
          currency_breakdown: analytics.currencyAnalytics.map(curr => ({
            currency: curr.currency,
            balance: curr.totalBalance,
            transaction_volume: curr.totalTransactionVolume,
            transaction_count: curr.transactionCount,
            market_share: curr.marketShare
          })),
          risk_summary: {
            overall_risk_level: analytics.riskMetrics.riskLevel,
            overall_risk_score: analytics.riskMetrics.overallRiskScore,
            liquidity_risk: analytics.riskMetrics.liquidityRisk,
            concentration_risk: analytics.riskMetrics.concentrationRisk,
            volatility_risk: analytics.riskMetrics.volatilityRisk,
            low_balance_accounts_count: analytics.riskMetrics.lowBalanceAccounts.length
          }
        };

      case 'detailed':
        return {
          report_info: {
            title: config.title,
            description: config.description,
            generated_at: generatedAt.toISOString()
          },
          analytics: analytics,
          metadata: metadata
        };

      case 'analytics':
        return {
          report_info: {
            title: config.title,
            description: config.description,
            generated_at: generatedAt.toISOString()
          },
          transaction_volume_analysis: analytics.transactionVolume,
          account_performance_analysis: analytics.accountPerformance,
          currency_analytics: analytics.currencyAnalytics,
          trend_analysis: analytics.trends,
          statistical_summary: analytics.summary
        };

      case 'risk':
        return {
          report_info: {
            title: config.title,
            description: config.description,
            generated_at: generatedAt.toISOString()
          },
          risk_assessment: analytics.riskMetrics,
          low_balance_accounts: analytics.riskMetrics.lowBalanceAccounts.map(acc => ({
            id: acc.id,
            name: acc.name,
            balance: acc.balance,
            currency: acc.currency,
            type: acc.type
          })),
          recommendations: analytics.riskMetrics.recommendations
        };

      case 'performance':
        return {
          report_info: {
            title: config.title,
            description: config.description,
            generated_at: generatedAt.toISOString()
          },
          account_performance: analytics.accountPerformance.map(perf => ({
            ...perf,
            performance_ranking: analytics.accountPerformance
              .sort((a, b) => Math.abs(b.netFlow) - Math.abs(a.netFlow))
              .indexOf(perf) + 1
          })),
          performance_summary: {
            high_performers: analytics.accountPerformance.filter(p => p.performance === 'high').length,
            medium_performers: analytics.accountPerformance.filter(p => p.performance === 'medium').length,
            low_performers: analytics.accountPerformance.filter(p => p.performance === 'low').length,
            top_account_by_volume: analytics.accountPerformance
              .sort((a, b) => Math.abs(b.netFlow) - Math.abs(a.netFlow))[0]?.accountName
          }
        };

      case 'transactions':
        const filteredTransactions = transactions
          .filter(tx => tx.timestamp >= config.dateRange.start && tx.timestamp <= config.dateRange.end)
          .filter(tx => config.currency ? tx.currency === config.currency : true)
          .filter(tx => config.accountIds ? 
            config.accountIds.includes(tx.fromAccountId) || config.accountIds.includes(tx.toAccountId) : true
          );

        return {
          report_info: {
            title: config.title,
            description: config.description,
            generated_at: generatedAt.toISOString()
          },
          transactions: filteredTransactions.map(tx => {
            const fromAccount = accounts.find(acc => acc.id === tx.fromAccountId);
            const toAccount = accounts.find(acc => acc.id === tx.toAccountId);
            
            return {
              id: tx.id,
              timestamp: tx.timestamp.toISOString(),
              from_account: {
                id: tx.fromAccountId,
                name: fromAccount?.name || 'Unknown',
                type: fromAccount?.type
              },
              to_account: {
                id: tx.toAccountId,
                name: toAccount?.name || 'Unknown',
                type: toAccount?.type
              },
              amount: tx.amount,
              currency: tx.currency,
              converted_amount: tx.convertedAmount,
              converted_currency: tx.convertedCurrency,
              exchange_rate: tx.exchangeRate,
              status: tx.status,
              note: tx.note
            };
          }),
          transaction_summary: {
            total_count: filteredTransactions.length,
            total_volume: filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0),
            by_status: {
              completed: filteredTransactions.filter(tx => tx.status === 'completed').length,
              pending: filteredTransactions.filter(tx => tx.status === 'pending').length,
              scheduled: filteredTransactions.filter(tx => tx.status === 'scheduled').length,
              failed: filteredTransactions.filter(tx => tx.status === 'failed').length
            },
            by_currency: {
              USD: filteredTransactions.filter(tx => tx.currency === 'USD').length,
              KES: filteredTransactions.filter(tx => tx.currency === 'KES').length,
              NGN: filteredTransactions.filter(tx => tx.currency === 'NGN').length
            }
          }
        };

      default:
        return data;
    }
  };

  const handleExportReport = async () => {
    setIsGenerating(true);
    
    try {
      const reportContent = generateReportContent(reportData);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${reportType}_report_${timestamp}`;

      if (exportFormat === 'csv') {
        // For CSV export, we need to flatten the data appropriately
        let csvData: any[] = [];
        
        switch (reportType) {
          case 'summary':
            csvData = Object.entries(reportContent.summary_metrics).map(([key, value]) => ({
              metric: key.replace(/_/g, ' ').toUpperCase(),
              value: value
            }));
            break;
          case 'performance':
            csvData = reportContent.account_performance;
            break;
          case 'transactions':
            csvData = reportContent.transactions;
            break;
          default:
            // For complex reports, export the analytics data
            csvData = reportData.analytics.accountPerformance;
        }
        
        exportToCsv(csvData, filename);
      } else {
        exportToJson(reportContent, filename);
      }
      
      // Show success message (you could add a toast notification here)
      console.log('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleAccountSelection = (accountId: string) => {
    setSelectedAccounts(prev => {
      if (prev.includes(accountId)) {
        return prev.filter(id => id !== accountId);
      } else {
        return [...prev, accountId];
      }
    });
  };

  const getPreviewData = () => {
    const { analytics } = reportData;
    
    switch (reportType) {
      case 'summary':
        return {
          'Total Volume': `$${analytics.summary.totalTransactionVolume.toLocaleString()}`,
          'Transaction Count': analytics.summary.totalTransactionCount.toString(),
          'Active Accounts': analytics.summary.activeAccountsCount.toString(),
          'Risk Level': analytics.riskMetrics.riskLevel.toUpperCase()
        };
      
      case 'performance':
        const topPerformer = analytics.accountPerformance
          .sort((a, b) => Math.abs(b.netFlow) - Math.abs(a.netFlow))[0];
        return {
          'Top Performer': topPerformer?.accountName || 'N/A',
          'Net Flow': `$${Math.abs(topPerformer?.netFlow || 0).toLocaleString()}`,
          'High Performers': analytics.accountPerformance.filter(p => p.performance === 'high').length.toString(),
          'Average Transaction Size': `$${analytics.summary.averageTransactionSize.toFixed(0)}`
        };
      
      case 'risk':
        return {
          'Overall Risk': analytics.riskMetrics.riskLevel.toUpperCase(),
          'Risk Score': `${analytics.riskMetrics.overallRiskScore.toFixed(1)}%`,
          'Low Balance Accounts': analytics.riskMetrics.lowBalanceAccounts.length.toString(),
          'Recommendations': analytics.riskMetrics.recommendations.length.toString()
        };
      
      default:
        return {
          'Records': reportData.metadata.recordCount.toString(),
          'Period': `${reportData.config.dateRange.start.toLocaleDateString()} - ${reportData.config.dateRange.end.toLocaleDateString()}`,
          'Currency Filter': reportData.config.currency || 'All',
          'Generated': reportData.generatedAt.toLocaleString()
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Report Generator</h2>
        <p className="text-gray-600 mt-1">Generate and export customized reports based on your treasury data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Type Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Report Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {reportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setReportType(type.value)}
                        className={`p-3 rounded-lg border transition-colors flex flex-col items-center space-y-2 ${
                          reportType === type.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium text-center">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {dateRanges.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency Filter</label>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value as Currency | 'all')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Currencies</option>
                    <option value="USD">USD</option>
                    <option value="KES">KES</option>
                    <option value="NGN">NGN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                <div className="flex space-x-3">
                  {exportFormats.map(format => (
                    <button
                      key={format.value}
                      onClick={() => setExportFormat(format.value)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        exportFormat === format.value
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {format.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Filter (optional)
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
                  <div className="space-y-2">
                    {accounts.filter(acc => acc.isActive).map(account => (
                      <label key={account.id} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedAccounts.includes(account.id)}
                          onChange={() => toggleAccountSelection(account.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{account.name} ({account.currency})</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Report Preview
            </h3>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900">{getReportTitle(reportType)}</h4>
                <p className="text-sm text-gray-600">
                  {getReportDescription(reportType, reportData.config.dateRange)}
                </p>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Key Metrics</h5>
                <div className="space-y-2">
                  {Object.entries(getPreviewData()).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
                <p>Records: {reportData.metadata.recordCount}</p>
                <p>Format: {exportFormat.toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportReport}
            disabled={isGenerating}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Export Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
