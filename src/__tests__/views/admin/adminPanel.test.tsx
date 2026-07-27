/**
 * Unit tests for views/admin/index.tsx (AdminControlPanel)
 *
 * Tests: tab rendering, payment resolution, refund management,
 * top-up actions, and invoice expiry via the confirmation modal.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

// ─── Mock AdminStatistics (chart-heavy subcomponent) ─────────────────────────
jest.mock('views/admin/components/adminStats', () => ({
  __esModule: true,
  default: () => <div data-testid="admin-statistics">Admin Stats</div>,
}));

// ─── Mock store with controllable state ──────────────────────────────────────
const mockResolvePaymentIntent = jest.fn();
const mockExpireInvoice = jest.fn();
const mockProcessRefund = jest.fn();
const mockProcessTopUp = jest.fn();

const WAITING_TRX = {
  id: 'TRX-WAIT-01',
  invoiceId: 'INV-001',
  customerName: 'Alice',
  amount: 500000,
  status: 'WAITING',
  date: '2026-07-01',
  method: 'VA_DUMMY',
};

const PENDING_INV = {
  id: 'INV-PEND-01',
  customerName: 'Bob',
  amount: 300000,
  description: 'Widget',
  status: 'PENDING',
  date: '2026-07-01',
  link: 'https://pay.app/INV-PEND-01',
};

const PENDING_REFUND = {
  id: 'REF-PEND-01',
  transactionId: 'TRX-001',
  amount: 200000,
  reason: 'Wrong item',
  status: 'PENDING',
  date: '2026-07-01',
};

const PENDING_TOPUP = {
  id: 'TOP-PEND-01',
  amount: 1000000,
  status: 'PENDING',
  date: '2026-07-01',
};

jest.mock('store/useGlobalData', () => ({
  useGlobalData: (selector: any) =>
    selector({
      invoices: [PENDING_INV],
      transactions: [WAITING_TRX],
      refunds: [PENDING_REFUND],
      topUps: [PENDING_TOPUP],
      resolvePaymentIntent: mockResolvePaymentIntent,
      expireInvoice: mockExpireInvoice,
      processRefund: mockProcessRefund,
      processTopUp: mockProcessTopUp,
    }),
}));

import AdminControlPanel from '../../../views/admin/index';

const renderAdmin = () =>
  render(
    <ChakraProvider>
      <MemoryRouter>
        <AdminControlPanel />
      </MemoryRouter>
    </ChakraProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AdminControlPanel — rendering', () => {
  it('renders all five tabs', () => {
    renderAdmin();
    expect(screen.getByText(/dashboard stats/i)).toBeInTheDocument();
    expect(screen.getByText(/payments/i)).toBeInTheDocument();
    expect(screen.getByText(/expire invoices/i)).toBeInTheDocument();
    // "Refunds" tab — use role=tab to be specific
    const tabs = screen.getAllByRole('tab');
    expect(tabs.some((t) => /refunds/i.test(t.textContent || ''))).toBe(true);
    expect(tabs.some((t) => /top-up requests/i.test(t.textContent || ''))).toBe(true);
  });

  it('shows pending task counts in summary cards', () => {
    renderAdmin();
    expect(screen.getByText(/pending tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/pending refunds/i)).toBeInTheDocument();
    expect(screen.getByText(/pending top-ups/i)).toBeInTheDocument();
  });

  it('renders AdminStatistics in first tab (Dashboard Stats)', () => {
    renderAdmin();
    expect(screen.getByTestId('admin-statistics')).toBeInTheDocument();
  });
});

describe('AdminControlPanel — Payments tab', () => {
  const openPaymentsTab = () => {
    renderAdmin();
    // Click Payments tab — text may include badge count
    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[1]); // Payments is index 1
  };

  it('shows WAITING transaction in payments table', () => {
    openPaymentsTab();
    expect(screen.getByText('TRX-WAIT-01')).toBeInTheDocument();
  });

  it('shows Approve and Reject buttons for WAITING transactions', () => {
    openPaymentsTab();
    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
  });

  it('opens confirmation modal on Approve click', () => {
    openPaymentsTab();
    fireEvent.click(screen.getByRole('button', { name: /approve/i }));
    expect(screen.getByText(/konfirmasi pembayaran/i)).toBeInTheDocument();
  });

  it('calls resolvePaymentIntent(id, true) after modal confirm', async () => {
    openPaymentsTab();
    fireEvent.click(screen.getByRole('button', { name: /approve/i }));
    // Modal confirm button
    fireEvent.click(screen.getByRole('button', { name: /setujui/i }));
    await waitFor(() => {
      expect(mockResolvePaymentIntent).toHaveBeenCalledWith('TRX-WAIT-01', true);
    });
  });

  it('calls resolvePaymentIntent(id, false) after modal reject confirm', async () => {
    openPaymentsTab();
    fireEvent.click(screen.getByRole('button', { name: /reject/i }));
    fireEvent.click(screen.getByRole('button', { name: /tolak/i }));
    await waitFor(() => {
      expect(mockResolvePaymentIntent).toHaveBeenCalledWith('TRX-WAIT-01', false);
    });
  });
});

describe('AdminControlPanel — Expire Invoices tab', () => {
  const openExpireTab = () => {
    renderAdmin();
    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[2]); // Expire Invoices is index 2
  };

  it('shows PENDING invoice in expire tab', () => {
    openExpireTab();
    expect(screen.getByText('INV-PEND-01')).toBeInTheDocument();
  });

  it('shows Force Expire button for PENDING invoice', () => {
    openExpireTab();
    expect(screen.getByRole('button', { name: /force expire/i })).toBeInTheDocument();
  });

  it('calls expireInvoice after modal confirm', async () => {
    openExpireTab();
    fireEvent.click(screen.getByRole('button', { name: /force expire/i }));
    fireEvent.click(screen.getByRole('button', { name: /proses kadaluwarsa/i }));
    await waitFor(() => {
      expect(mockExpireInvoice).toHaveBeenCalledWith('INV-PEND-01');
    });
  });
});

describe('AdminControlPanel — Refunds tab', () => {
  const openRefundsTab = () => {
    renderAdmin();
    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[3]); // Refunds is index 3
  };

  it('shows pending refund entry', () => {
    openRefundsTab();
    expect(screen.getByText('REF-PEND-01')).toBeInTheDocument();
    expect(screen.getByText(/wrong item/i)).toBeInTheDocument();
  });

  it('calls processRefund(id, true) on approve', async () => {
    openRefundsTab();
    fireEvent.click(screen.getAllByRole('button', { name: /approve/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /setujui refund/i }));
    await waitFor(() => {
      expect(mockProcessRefund).toHaveBeenCalledWith('REF-PEND-01', true);
    });
  });

  it('calls processRefund(id, false) on reject', async () => {
    openRefundsTab();
    fireEvent.click(screen.getAllByRole('button', { name: /reject/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /tolak refund/i }));
    await waitFor(() => {
      expect(mockProcessRefund).toHaveBeenCalledWith('REF-PEND-01', false);
    });
  });
});

describe('AdminControlPanel — Top-Up tab', () => {
  const openTopUpTab = () => {
    renderAdmin();
    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[4]); // Top-Up is index 4
  };

  it('shows pending top-up entry', () => {
    openTopUpTab();
    expect(screen.getByText('TOP-PEND-01')).toBeInTheDocument();
  });

  it('calls processTopUp(id, true) on approve', async () => {
    openTopUpTab();
    fireEvent.click(screen.getAllByRole('button', { name: /approve/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /setujui top-up/i }));
    await waitFor(() => {
      expect(mockProcessTopUp).toHaveBeenCalledWith('TOP-PEND-01', true);
    });
  });

  it('calls processTopUp(id, false) on reject', async () => {
    openTopUpTab();
    fireEvent.click(screen.getAllByRole('button', { name: /reject/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /tolak top-up/i }));
    await waitFor(() => {
      expect(mockProcessTopUp).toHaveBeenCalledWith('TOP-PEND-01', false);
    });
  });
});
