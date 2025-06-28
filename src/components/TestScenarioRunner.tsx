import React, { useState } from 'react';
import { Account, TransferFormData } from '../types';
import { TEST_SCENARIOS, executeTestScenario, TestScenario } from '../data/testScenarios';
import { Play, Pause, RotateCcw, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

interface TestScenarioRunnerProps {
  accounts: Account[];
  executeTransfer: (formData: TransferFormData) => boolean;
}

interface ScenarioResult {
  scenarioId: string;
  success: number;
  failed: number;
  errors: string[];
  duration: number;
  status: 'idle' | 'running' | 'completed' | 'error';
}

const TestScenarioRunner: React.FC<TestScenarioRunnerProps> = ({ accounts, executeTransfer }) => {
  const [results, setResults] = useState<Record<string, ScenarioResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>('');

  const runScenario = async (scenario: TestScenario) => {
    setIsRunning(true);
    
    // Initialize result
    setResults(prev => ({
      ...prev,
      [scenario.id]: {
        scenarioId: scenario.id,
        success: 0,
        failed: 0,
        errors: [],
        duration: 0,
        status: 'running'
      }
    }));

    const startTime = Date.now();

    try {
      // Add small delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = executeTestScenario(scenario, accounts, executeTransfer);
      const duration = Date.now() - startTime;

      setResults(prev => ({
        ...prev,
        [scenario.id]: {
          scenarioId: scenario.id,
          ...result,
          duration,
          status: result.failed > 0 ? 'error' : 'completed'
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [scenario.id]: {
          scenarioId: scenario.id,
          success: 0,
          failed: scenario.transfers.length,
          errors: ['Unexpected error occurred'],
          duration: Date.now() - startTime,
          status: 'error'
        }
      }));
    }

    setIsRunning(false);
  };

  const runAllScenarios = async () => {
    setIsRunning(true);
    
    for (const scenario of TEST_SCENARIOS) {
      await runScenario(scenario);
      // Small delay between scenarios
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsRunning(false);
  };

  const clearResults = () => {
    setResults({});
  };

  const getStatusIcon = (status: ScenarioResult['status']) => {
    switch (status) {
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Pause className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSuccessRate = (result: ScenarioResult) => {
    const total = result.success + result.failed;
    return total > 0 ? ((result.success / total) * 100).toFixed(1) : '0';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Test Scenario Runner</h3>
          <p className="text-sm text-gray-600">Execute predefined test scenarios to validate system functionality</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={runAllScenarios}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span>Run All</span>
          </button>
          <button
            onClick={clearResults}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario List */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Available Scenarios</h4>
          {TEST_SCENARIOS.map(scenario => {
            const result = results[scenario.id];
            
            return (
              <div
                key={scenario.id}
                className={`
                  border rounded-lg p-4 cursor-pointer transition-all
                  ${selectedScenario === scenario.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => setSelectedScenario(scenario.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result?.status || 'idle')}
                    <h5 className="font-medium text-gray-900">{scenario.name}</h5>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      runScenario(scenario);
                    }}
                    disabled={isRunning}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    <span>Run</span>
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{scenario.transfers.length} transfers</span>
                  {result && (
                    <div className="flex items-center space-x-4">
                      <span className="text-green-600">{result.success} success</span>
                      <span className="text-red-600">{result.failed} failed</span>
                      <span>{result.duration}ms</span>
                      <span className="font-medium">{getSuccessRate(result)}% success rate</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scenario Details */}
        <div>
          {selectedScenario && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Scenario Details</h4>
              
              {(() => {
                const scenario = TEST_SCENARIOS.find(s => s.id === selectedScenario);
                const result = results[selectedScenario];
                
                if (!scenario) return null;
                
                return (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">{scenario.name}</h5>
                      <p className="text-sm text-gray-600">{scenario.description}</p>
                    </div>

                    {scenario.accountFilters && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <h6 className="text-sm font-medium text-gray-700 mb-2">Account Filters</h6>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {scenario.accountFilters.fromCurrency && (
                            <div>From Currency: <span className="font-medium">{scenario.accountFilters.fromCurrency}</span></div>
                          )}
                          {scenario.accountFilters.toCurrency && (
                            <div>To Currency: <span className="font-medium">{scenario.accountFilters.toCurrency}</span></div>
                          )}
                          {scenario.accountFilters.fromType && (
                            <div>From Type: <span className="font-medium">{scenario.accountFilters.fromType}</span></div>
                          )}
                          {scenario.accountFilters.toType && (
                            <div>To Type: <span className="font-medium">{scenario.accountFilters.toType}</span></div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <h6 className="text-sm font-medium text-gray-700 mb-2">
                        Transfers ({scenario.transfers.length})
                      </h6>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {scenario.transfers.slice(0, 10).map((transfer, index) => (
                          <div key={index} className="text-xs p-2 bg-gray-50 rounded flex justify-between">
                            <span className="truncate">{transfer.note || `Transfer ${index + 1}`}</span>
                            <span className="font-medium">${transfer.amount.toLocaleString()}</span>
                          </div>
                        ))}
                        {scenario.transfers.length > 10 && (
                          <div className="text-xs text-gray-500 text-center py-1">
                            ... and {scenario.transfers.length - 10} more
                          </div>
                        )}
                      </div>
                    </div>

                    {result && (
                      <div className="border-t border-gray-200 pt-4">
                        <h6 className="text-sm font-medium text-gray-700 mb-2">Results</h6>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-green-600">✓ {result.success} successful</div>
                            <div className="text-red-600">✗ {result.failed} failed</div>
                          </div>
                          <div>
                            <div>Duration: {result.duration}ms</div>
                            <div>Success Rate: {getSuccessRate(result)}%</div>
                          </div>
                        </div>
                        
                        {result.errors.length > 0 && (
                          <div className="mt-3">
                            <h6 className="text-sm font-medium text-red-700 mb-1">Errors</h6>
                            <div className="max-h-20 overflow-y-auto space-y-1">
                              {result.errors.map((error, index) => (
                                <div key={index} className="text-xs text-red-600 bg-red-50 p-1 rounded">
                                  {error}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestScenarioRunner;