import React from 'react';
import { Account } from '../types';
import { formatCurrency, getCurrencyBadgeClasses } from '../utils/currency';
import { Wallet, Building2, Smartphone, Briefcase } from 'lucide-react';

interface AccountCardProps {
  account: Account;
  onClick?: () => void;
  isSelected?: boolean;
}

const AccountCard: React.FC<AccountCardProps> = ({ account, onClick, isSelected }) => {
  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'Mpesa': return <Smartphone className="w-5 h-5" />;
      case 'Bank': return <Building2 className="w-5 h-5" />;
      case 'Wallet': return <Wallet className="w-5 h-5" />;
      case 'Corporate': return <Briefcase className="w-5 h-5" />;
      default: return <Wallet className="w-5 h-5" />;
    }
  };

  return (
    <div 
      className={`
        bg-white rounded-xl shadow-sm border-2 transition-all duration-200 cursor-pointer
        hover:shadow-lg hover:-translate-y-1
        ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100 hover:border-gray-200'}
      `}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              {getAccountIcon(account.type)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{account.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={getCurrencyBadgeClasses(account.currency)}>
                  {account.currency}
                </span>
                <span className="text-xs text-gray-500">{account.type}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Balance</span>
            <span className="font-bold text-lg text-gray-900">
              {formatCurrency(account.balance, account.currency)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Status</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              account.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {account.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountCard;