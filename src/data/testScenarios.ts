import { TransferFormData, Account } from '../types';

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  transfers: Omit<TransferFormData, 'fromAccountId' | 'toAccountId'>[];
  accountFilters?: {
    fromCurrency?: string;
    toCurrency?: string;
    fromType?: string;
    toType?: string;
  };
}

export const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'payroll_simulation',
    name: 'Monthly Payroll',
    description: 'Simulate monthly salary distribution from corporate accounts to employee accounts',
    transfers: [
      { amount: 2500, note: 'Software Engineer - Monthly Salary' },
      { amount: 3000, note: 'Senior Developer - Monthly Salary' },
      { amount: 1800, note: 'Junior Developer - Monthly Salary' },
      { amount: 4500, note: 'Team Lead - Monthly Salary' },
      { amount: 2200, note: 'QA Engineer - Monthly Salary' },
      { amount: 3500, note: 'DevOps Engineer - Monthly Salary' },
      { amount: 2800, note: 'UI/UX Designer - Monthly Salary' },
      { amount: 5000, note: 'Project Manager - Monthly Salary' }
    ],
    accountFilters: {
      fromType: 'Corporate',
      fromCurrency: 'USD'
    }
  },
  {
    id: 'vendor_payments',
    name: 'Vendor Payments',
    description: 'Process payments to various vendors and suppliers',
    transfers: [
      { amount: 15000, note: 'Office rent - Q1 payment' },
      { amount: 8500, note: 'Cloud infrastructure - Monthly bill' },
      { amount: 3200, note: 'Software licenses - Annual renewal' },
      { amount: 1200, note: 'Office supplies and equipment' },
      { amount: 2800, note: 'Marketing agency - Campaign costs' },
      { amount: 4500, note: 'Legal services - Contract review' },
      { amount: 6700, note: 'Accounting services - Monthly retainer' }
    ],
    accountFilters: {
      fromType: 'Corporate'
    }
  },
  {
    id: 'emergency_distribution',
    name: 'Emergency Fund Distribution',
    description: 'Distribute emergency funds to operational accounts during crisis',
    transfers: [
      { amount: 25000, note: 'Emergency operational funding - Account 1' },
      { amount: 15000, note: 'Emergency operational funding - Account 2' },
      { amount: 30000, note: 'Emergency operational funding - Account 3' },
      { amount: 10000, note: 'Emergency petty cash allocation' },
      { amount: 20000, note: 'Emergency vendor payment fund' }
    ],
    accountFilters: {
      fromCurrency: 'USD'
    }
  },
  {
    id: 'cross_currency_arbitrage',
    name: 'Currency Arbitrage',
    description: 'Exploit exchange rate differences for profit optimization',
    transfers: [
      { amount: 1000, note: 'USD → KES arbitrage opportunity' },
      { amount: 132500, note: 'KES → NGN conversion for better rates' },
      { amount: 789290, note: 'NGN → USD completion of arbitrage cycle' },
      { amount: 500, note: 'USD → NGN direct conversion test' },
      { amount: 66250, note: 'KES → USD reverse conversion' }
    ]
  },
  {
    id: 'micro_transactions',
    name: 'Micro-Transactions',
    description: 'High-frequency small value transactions for testing system performance',
    transfers: [
      { amount: 10, note: 'Micro-payment #1' },
      { amount: 25, note: 'Micro-payment #2' },
      { amount: 50, note: 'Micro-payment #3' },
      { amount: 15, note: 'Micro-payment #4' },
      { amount: 30, note: 'Micro-payment #5' },
      { amount: 75, note: 'Micro-payment #6' },
      { amount: 20, note: 'Micro-payment #7' },
      { amount: 40, note: 'Micro-payment #8' },
      { amount: 60, note: 'Micro-payment #9' },
      { amount: 35, note: 'Micro-payment #10' }
    ]
  },
  {
    id: 'investment_rebalancing',
    name: 'Investment Portfolio Rebalancing',
    description: 'Rebalance investment portfolios across different currencies',
    transfers: [
      { amount: 50000, note: 'Portfolio rebalancing - USD allocation' },
      { amount: 25000, note: 'Portfolio rebalancing - KES allocation' },
      { amount: 75000, note: 'Portfolio rebalancing - NGN allocation' },
      { amount: 30000, note: 'Diversification transfer - Emerging markets' },
      { amount: 40000, note: 'Risk management - Safe haven allocation' }
    ],
    accountFilters: {
      fromType: 'Corporate'
    }
  },
  {
    id: 'scheduled_transfers',
    name: 'Scheduled Transfers',
    description: 'Set up future scheduled transfers for automated processing',
    transfers: [
      { 
        amount: 5000, 
        note: 'Weekly operational funding',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week from now
      },
      { 
        amount: 2500, 
        note: 'Bi-weekly payroll supplement',
        scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 2 weeks from now
      },
      { 
        amount: 10000, 
        note: 'Monthly vendor payment batch',
        scheduledDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 1 month from now
      },
      { 
        amount: 1000, 
        note: 'Daily operational expenses',
        scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day from now
      }
    ]
  },
  {
    id: 'stress_test',
    name: 'System Stress Test',
    description: 'High-volume transactions to test system performance and limits',
    transfers: Array.from({ length: 50 }, (_, i) => ({
      amount: Math.floor(Math.random() * 10000) + 100,
      note: `Stress test transaction #${i + 1}`
    }))
  }
];

export const getRandomAccountPair = (accounts: Account[], filters?: TestScenario['accountFilters']) => {
  let eligibleFromAccounts = accounts.filter(acc => acc.isActive);
  let eligibleToAccounts = accounts.filter(acc => acc.isActive);

  if (filters?.fromCurrency) {
    eligibleFromAccounts = eligibleFromAccounts.filter(acc => acc.currency === filters.fromCurrency);
  }
  if (filters?.toCurrency) {
    eligibleToAccounts = eligibleToAccounts.filter(acc => acc.currency === filters.toCurrency);
  }
  if (filters?.fromType) {
    eligibleFromAccounts = eligibleFromAccounts.filter(acc => acc.type === filters.fromType);
  }
  if (filters?.toType) {
    eligibleToAccounts = eligibleToAccounts.filter(acc => acc.type === filters.toType);
  }

  const fromAccount = eligibleFromAccounts[Math.floor(Math.random() * eligibleFromAccounts.length)];
  const toAccount = eligibleToAccounts.filter(acc => acc.id !== fromAccount?.id)[
    Math.floor(Math.random() * (eligibleToAccounts.length - 1))
  ];

  return { fromAccount, toAccount };
};

export const executeTestScenario = (
  scenario: TestScenario,
  accounts: Account[],
  executeTransfer: (formData: TransferFormData) => boolean
): { success: number; failed: number; errors: string[] } => {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  scenario.transfers.forEach((transfer, index) => {
    const { fromAccount, toAccount } = getRandomAccountPair(accounts, scenario.accountFilters);
    
    if (!fromAccount || !toAccount) {
      failed++;
      errors.push(`Transfer ${index + 1}: Could not find suitable account pair`);
      return;
    }

    const transferData: TransferFormData = {
      fromAccountId: fromAccount.id,
      toAccountId: toAccount.id,
      ...transfer
    };

    const result = executeTransfer(transferData);
    if (result) {
      success++;
    } else {
      failed++;
      errors.push(`Transfer ${index + 1}: Validation failed`);
    }
  });

  return { success, failed, errors };
};