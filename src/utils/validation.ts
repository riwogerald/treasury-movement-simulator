import { Account, TransferFormData } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateTransfer = (
  formData: TransferFormData,
  accounts: Account[]
): ValidationResult => {
  const errors: string[] = [];

  // Check if accounts exist
  const fromAccount = accounts.find(a => a.id === formData.fromAccountId);
  const toAccount = accounts.find(a => a.id === formData.toAccountId);

  if (!fromAccount) {
    errors.push('Source account not found');
  }

  if (!toAccount) {
    errors.push('Destination account not found');
  }

  // Check for self-transfer
  if (formData.fromAccountId === formData.toAccountId) {
    errors.push('Cannot transfer to the same account');
  }

  // Validate amount
  if (!formData.amount || formData.amount <= 0) {
    errors.push('Amount must be greater than zero');
  }

  // Check sufficient balance
  if (fromAccount && formData.amount > fromAccount.balance) {
    errors.push('Insufficient funds in source account');
  }

  // Validate scheduled date if provided
  if (formData.scheduledDate) {
    const scheduledDate = new Date(formData.scheduledDate);
    const now = new Date();
    if (scheduledDate <= now) {
      errors.push('Scheduled date must be in the future');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 999999999;
};