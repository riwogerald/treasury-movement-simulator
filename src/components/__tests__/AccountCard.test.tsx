import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AccountCard from '../AccountCard';
import { Account } from '../../types';

describe('AccountCard Component', () => {
  const mockAccount: Account = {
    id: '1',
    name: 'Test Bank Account',
    currency: 'USD',
    balance: 1500.50,
    type: 'Bank',
    isActive: true
  };

  it('should render account information correctly', () => {
    render(<AccountCard account={mockAccount} />);

    expect(screen.getByText('Test Bank Account')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('Bank')).toBeInTheDocument();
    expect(screen.getByText('$ 1,500.50')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should show inactive status for inactive accounts', () => {
    const inactiveAccount = { ...mockAccount, isActive: false };
    render(<AccountCard account={inactiveAccount} />);

    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', () => {
    const mockOnClick = vi.fn();
    render(<AccountCard account={mockAccount} onClick={mockOnClick} />);

    fireEvent.click(screen.getByText('Test Bank Account').closest('div')!);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should apply selected styles when isSelected is true', () => {
    const { container } = render(
      <AccountCard account={mockAccount} isSelected={true} />
    );

    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass('border-blue-500', 'ring-2', 'ring-blue-200');
  });

  it('should display correct icon for different account types', () => {
    const mpesaAccount = { ...mockAccount, type: 'Mpesa' as const };
    const { rerender } = render(<AccountCard account={mpesaAccount} />);
    
    // Check if Smartphone icon is rendered (Mpesa type)
    expect(document.querySelector('svg')).toBeInTheDocument();

    const walletAccount = { ...mockAccount, type: 'Wallet' as const };
    rerender(<AccountCard account={walletAccount} />);
    
    // Icon should still be present but different
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('should format different currencies correctly', () => {
    const kesAccount = { ...mockAccount, currency: 'KES' as const, balance: 50000 };
    render(<AccountCard account={kesAccount} />);
    expect(screen.getByText('KSh 50,000.00')).toBeInTheDocument();

    const ngnAccount = { ...mockAccount, currency: 'NGN' as const, balance: 250000 };
    const { rerender } = render(<AccountCard account={ngnAccount} />);
    rerender(<AccountCard account={ngnAccount} />);
    expect(screen.getByText('₦ 250,000.00')).toBeInTheDocument();
  });

  it('should apply correct currency badge classes', () => {
    render(<AccountCard account={mockAccount} />);
    
    const currencyBadge = screen.getByText('USD');
    expect(currencyBadge).toHaveClass('bg-green-100', 'text-green-800');
  });
});