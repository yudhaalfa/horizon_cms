/**
 * Unit tests for views/merchant/default/index.tsx (MerchantDashboard)
 *
 * Tests: balance display, tab navigation, modal triggers, action calls.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

// ─── Mock heavy sub-components ───────────────────────────────────────────────
jest.mock('views/merchant/invoiceTable', () => ({
  __esModule: true,
  default: ({ onOpenCreate }: any) => (
    <div data-testid="invoices-table">
      <button onClick={onOpenCreate}>Create Invoice</button>
    </div>
  ),
}));

jest.mock('views/merchant/modals/createInvoice', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onCreate }: any) =>
    isOpen ? (
      <div data-testid="create-invoice-modal">
        <button onClick={() => onCreate({ customerName: 'Test', description: 'Item', amount: 100000 })}>
          Submit Invoice
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

jest.mock('views/merchant/topUpHistory', () => ({
  __esModule: true,
  default: () => <div data-testid="topup-history-table" />,
}));

jest.mock('views/merchant/modals/topUp', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onSubmit }: any) =>
    isOpen ? (
      <div data-testid="topup-modal">
        <button onClick={() => onSubmit(500000)}>Submit TopUp</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

jest.mock('views/merchant/transactionTables', () => ({
  __esModule: true,
  default: ({ onOpenRefund }: any) => (
    <div data-testid="transactions-table">
      <button onClick={() => onOpenRefund('TRX-001')}>Request Refund</button>
    </div>
  ),
}));

jest.mock('views/merchant/modals/refundModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onSubmit }: any) =>
    isOpen ? (
      <div data-testid="refund-modal">
        <button onClick={() => onSubmit('Wrong item')}>Submit Refund</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// ─── Mock store ───────────────────────────────────────────────────────────────
const mockCreateInvoice = jest.fn();
const mockRequestTopUp = jest.fn();
const mockRequestRefund = jest.fn();

jest.mock('store/useGlobalData', () => ({
  useGlobalData: (selector: any) =>
    selector({
      balance: 12500000,
      invoices: [],
      topUps: [],
      transactions: [],
      createInvoice: mockCreateInvoice,
      requestTopUp: mockRequestTopUp,
      requestRefund: mockRequestRefund,
    }),
}));

import MerchantDashboard from '../../../views/merchant/default/index';

const renderDashboard = () =>
  render(
    <ChakraProvider>
      <MemoryRouter>
        <MerchantDashboard />
      </MemoryRouter>
    </ChakraProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe('MerchantDashboard — rendering', () => {
  it('renders wallet balance label', () => {
    renderDashboard();
    expect(screen.getByText(/wallet balance/i)).toBeInTheDocument();
  });

  it('renders formatted balance (IDR)', () => {
    renderDashboard();
    // Rp12.500.000 or similar formatted output
    expect(screen.getByText(/12\.500\.000|12,500,000/)).toBeInTheDocument();
  });

  it('renders three tabs: Invoices, Transactions, Top-Up History', () => {
    renderDashboard();
    expect(screen.getByRole('tab', { name: /invoices/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /transactions/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /top-up history/i })).toBeInTheDocument();
  });

  it('renders InvoicesTable by default (first tab)', () => {
    renderDashboard();
    expect(screen.getByTestId('invoices-table')).toBeInTheDocument();
  });

  it('renders Request Top-Up button', () => {
    renderDashboard();
    expect(screen.getByRole('button', { name: /request top-up/i })).toBeInTheDocument();
  });
});

describe('MerchantDashboard — tabs', () => {
  it('switches to Transactions tab', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: /transactions/i }));
    expect(screen.getByTestId('transactions-table')).toBeInTheDocument();
  });

  it('switches to Top-Up History tab', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: /top-up history/i }));
    expect(screen.getByTestId('topup-history-table')).toBeInTheDocument();
  });
});

describe('MerchantDashboard — invoice creation', () => {
  it('opens create invoice modal', () => {
    renderDashboard();
    // CreateInvoice button is inside mocked InvoicesTable
    fireEvent.click(screen.getByText('Create Invoice'));
    expect(screen.getByTestId('create-invoice-modal')).toBeInTheDocument();
  });

  it('calls createInvoice when modal submits', async () => {
    renderDashboard();
    fireEvent.click(screen.getByText('Create Invoice'));
    fireEvent.click(screen.getByText('Submit Invoice'));
    await waitFor(() => {
      expect(mockCreateInvoice).toHaveBeenCalledWith(
        expect.objectContaining({ customerName: 'Test', amount: 100000 }),
      );
    });
  });
});

describe('MerchantDashboard — top-up', () => {
  it('opens top-up modal when Request Top-Up is clicked', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /request top-up/i }));
    expect(screen.getByTestId('topup-modal')).toBeInTheDocument();
  });

  it('calls requestTopUp with amount when modal submits', async () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /request top-up/i }));
    fireEvent.click(screen.getByText('Submit TopUp'));
    await waitFor(() => {
      expect(mockRequestTopUp).toHaveBeenCalledWith(500000);
    });
  });
});

describe('MerchantDashboard — refund', () => {
  it('opens refund modal from TransactionsTable', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: /transactions/i }));
    fireEvent.click(screen.getByText('Request Refund'));
    expect(screen.getByTestId('refund-modal')).toBeInTheDocument();
  });

  it('calls requestRefund with trxId and reason when submitted', async () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('tab', { name: /transactions/i }));
    fireEvent.click(screen.getByText('Request Refund'));
    fireEvent.click(screen.getByText('Submit Refund'));
    await waitFor(() => {
      expect(mockRequestRefund).toHaveBeenCalledWith('TRX-001', 'Wrong item');
    });
  });
});
