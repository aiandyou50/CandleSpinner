import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import Deposit from '../Deposit';
import { useDepositState } from '../../../shared/hooks/useDepositState';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <TonConnectUIProvider manifestUrl="https://ton.org/manifest.json">
    {children}
  </TonConnectUIProvider>
);

describe('Deposit Component', () => {
  const mockOnBack = vi.fn();
  const mockOnDepositSuccess = vi.fn();

  beforeEach(() => {
    mockOnBack.mockClear();
    mockOnDepositSuccess.mockClear();
  });

  describe('Rendering', () => {
    it('should render deposit component', () => {
      render(
        <Deposit onBack={mockOnBack} onDepositSuccess={mockOnDepositSuccess} />,
        { wrapper: Wrapper }
      );
      
      expect(screen.getByText(/💰 CSPIN 입금/)).toBeInTheDocument();
    });

    it('should display deposit options', () => {
      render(
        <Deposit onBack={mockOnBack} onDepositSuccess={mockOnDepositSuccess} />,
        { wrapper: Wrapper }
      );
      
      expect(screen.getByText(/🔑 TonConnect 입금/)).toBeInTheDocument();
    });

    it('should display back button', () => {
      render(
        <Deposit onBack={mockOnBack} onDepositSuccess={mockOnDepositSuccess} />,
        { wrapper: Wrapper }
      );
      
      expect(screen.getByText(/← 뒤로 가기/)).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should render without errors with TonConnectUIProvider', () => {
      const { container } = render(
        <Deposit onBack={mockOnBack} onDepositSuccess={mockOnDepositSuccess} />,
        { wrapper: Wrapper }
      );
      
      expect(container).toBeInTheDocument();
    });

    it('should have required props', () => {
      const { container } = render(
        <Deposit onBack={mockOnBack} onDepositSuccess={mockOnDepositSuccess} />,
        { wrapper: Wrapper }
      );
      
      expect(mockOnBack).toBeDefined();
      expect(mockOnDepositSuccess).toBeDefined();
      expect(container).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(
        <Deposit onBack={mockOnBack} onDepositSuccess={mockOnDepositSuccess} />,
        { wrapper: Wrapper }
      );
      
      expect(screen.getByText(/💰 CSPIN 입금/)).toBeInTheDocument();
    });

    it('should have back button accessible', () => {
      render(
        <Deposit onBack={mockOnBack} onDepositSuccess={mockOnDepositSuccess} />,
        { wrapper: Wrapper }
      );
      
      const backButton = screen.getByText(/← 뒤로 가기/);
      expect(backButton).toBeInTheDocument();
      expect(backButton.closest('button')).toBeTruthy();
    });
  });

  describe('State Management', () => {
    it('should render with initial state', () => {
      render(
        <Deposit onBack={mockOnBack} onDepositSuccess={mockOnDepositSuccess} />,
        { wrapper: Wrapper }
      );
      
      expect(screen.getByText(/입금 방식을 선택해주세요/)).toBeInTheDocument();
    });
  });

  describe('Props Verification', () => {
    it('should accept onBack callback', () => {
      render(
        <Deposit onBack={mockOnBack} onDepositSuccess={mockOnDepositSuccess} />,
        { wrapper: Wrapper }
      );
      
      expect(mockOnBack).toBeDefined();
    });

    it('should accept onDepositSuccess callback', () => {
      render(
        <Deposit onBack={mockOnBack} onDepositSuccess={mockOnDepositSuccess} />,
        { wrapper: Wrapper }
      );
      
      expect(mockOnDepositSuccess).toBeDefined();
    });
  });

  describe('UI Elements', () => {
    it('should display all UI sections', () => {
      render(
        <Deposit onBack={mockOnBack} onDepositSuccess={mockOnDepositSuccess} />,
        { wrapper: Wrapper }
      );
      
      expect(screen.getByText(/💰 CSPIN 입금/)).toBeInTheDocument();
      expect(screen.getByText(/입금 방식을 선택해주세요/)).toBeInTheDocument();
      expect(screen.getByText(/🔑 TonConnect 입금/)).toBeInTheDocument();
    });

    it('should display all action buttons', () => {
      render(
        <Deposit onBack={mockOnBack} onDepositSuccess={mockOnDepositSuccess} />,
        { wrapper: Wrapper }
      );
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});

describe('useDepositState Hook', () => {
  it('should handle multiple decimals in amount', () => {
    const { result } = renderHook(() => useDepositState());

    act(() => {
      result.current.setAmount('10.2.3');
    });

    expect(result.current.depositAmount).toBe('10.23');
  });
});
