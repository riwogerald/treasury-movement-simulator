import React, { useState, useEffect } from 'react';
import { Account, TransferFormData, Currency } from '../types';
import { formatCurrency, convertCurrency, getExchangeRate } from '../utils/currency';
import { validateTransfer } from '../utils/validation';
import { X, ArrowRight, AlertCircle, Calendar } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onTransfer: (formData: TransferFormData) => boolean;
  preselectedFromAccount?: string;
}

const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onTransfer,
  preselectedFromAccount
}) => {
  const [formData, setFormData] = useState<TransferFormData>({
    fromAccountId: preselectedFromAccount || '',
    toAccountId: '',
    amount: 0,
    note: '',
    scheduledDate: ''
  });
  
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (preselectedFromAccount) {
      setFormData(prev => ({ ...prev, fromAccountId: preselectedFromAccount }));
    }
  }, [preselectedFromAccount]);

  const fromAccount = accounts.find(a => a.id === formData.fromAccountId);
  const toAccount = accounts.find(a => a.id === formData.toAccountId);

  const exchangeRate = fromAccount && toAccount && fromAccount.currency !== toAccount.currency
    ? getExchangeRate(fromAccount.currency, toAccount.currency)
    : null;

  const convertedAmount = exchangeRate && formData.amount
    ? convertCurrency(formData.amount, fromAccount!.currency, toAccount!.currency)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const validation = validateTransfer(formData, accounts);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsProcessing(false);
      return;
    }

    const success = onTransfer(formData);
    if (success) {
      // Reset form and close modal
      setFormData({
        fromAccountId: '',
        toAccountId: '',
        amount: 0,
        note: '',
        scheduledDate: ''
      });
      setErrors([]);
      onClose();
    }
    
    setIsProcessing(false);
  };

  const availableToAccounts = accounts.filter(a => 
    a.id !== formData.fromAccountId && a.isActive
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Transfer Funds</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Account
              </label>
              <select
                value={formData.fromAccountId}
                onChange={(e) => setFormData({ ...formData, fromAccountId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select source account</option>
                {accounts.filter(a => a.isActive).map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {formatCurrency(account.balance, account.currency)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Account
              </label>
              <select
                value={formData.toAccountId}
                onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select destination account</option>
                {availableToAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {account.currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount {fromAccount && `(${fromAccount.currency})`}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter amount"
              required
            />
            {fromAccount && (
              <p className="mt-1 text-sm text-gray-600">
                Available balance: {formatCurrency(fromAccount.balance, fromAccount.currency)}
              </p>
            )}
          </div>

          {exchangeRate && convertedAmount && fromAccount && toAccount && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-blue-900">
                    {formatCurrency(formData.amount, fromAccount.currency)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {formatCurrency(convertedAmount, toAccount.currency)}
                  </span>
                </div>
                <span className="text-sm text-blue-700">
                  Rate: {exchangeRate.toFixed(4)}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Schedule Transfer (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (Optional)
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Add a note for this transfer..."
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing...' : formData.scheduledDate ? 'Schedule Transfer' : 'Transfer Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;