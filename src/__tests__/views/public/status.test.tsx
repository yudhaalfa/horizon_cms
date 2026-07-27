/**
 * Unit tests for views/public/status/index.tsx (PublicStatus)
 *
 * Tests: invoice not found, PAID, WAITING, PENDING, and FAILED/EXPIRED states.
 * Also validates MERCHANT-only navigation buttons.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

let mockInvoices: any[] = [];
let mockTransactions: any[] = [];
let mockUser: any = null;

jest.mock('store/useGlobalData', () => ({
  useGlobalData: (selector: any) =>
    selector({
      invoices: mockInvoices,
      transactions: mockTransactions,
    }),
}));

jest.mock('store/useAuthStore', () => ({
  useAuthStore: (selector: any) => selector({ user: mockUser }),
}));

import PublicStatus from '../../../views/public/status/index';

const renderStatus = (invoiceId = 'INV-001') =>
  render(
    <ChakraProvider>
      <MemoryRouter initialEntries={[`/public-status/${invoiceId}`]}>
        <Routes>
          <Route path="/public-status/:id" element={<PublicStatus />} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockInvoices = [];
  mockTransactions = [];
  mockUser = null;
});

describe('PublicStatus — invoice not found', () => {
  it('shows Invoice Not Found', () => {
    renderStatus('NONEXISTENT');
    expect(screen.getByText(/invoice not found/i)).toBeInTheDocument();
  });

  it('shows Back to Dashboard for MERCHANT user when invoice not found', () => {
    mockUser = { role: 'MERCHANT' };
    renderStatus('NONEXISTENT');
    expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument();
  });
});

describe('PublicStatus — PAID invoice', () => {
  beforeEach(() => {
    mockInvoices = [
      { id: 'INV-001', description: 'Widget', status: 'PAID', customerName: 'Alice', amount: 100000, date: '2026-07-01', link: '' },
    ];
  });

  it('shows Payment Successful heading', () => {
    renderStatus('INV-001');
    expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
  });

  it('shows Back to Dashboard button for MERCHANT', () => {
    mockUser = { role: 'MERCHANT' };
    renderStatus('INV-001');
    expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument();
  });

  it('shows Close Window button for guest', () => {
    mockUser = null;
    renderStatus('INV-001');
    expect(screen.getByRole('button', { name: /close window/i })).toBeInTheDocument();
  });

  it('navigates to / when Close Window is clicked (guest)', () => {
    mockUser = null;
    renderStatus('INV-001');
    fireEvent.click(screen.getByRole('button', { name: /close window/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates to /merchant/default when Back to Dashboard is clicked (merchant)', () => {
    mockUser = { role: 'MERCHANT' };
    renderStatus('INV-001');
    fireEvent.click(screen.getByRole('button', { name: /back to dashboard/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/merchant/default');
  });
});

describe('PublicStatus — WAITING invoice', () => {
  beforeEach(() => {
    mockInvoices = [
      { id: 'INV-001', description: 'Widget', status: 'WAITING', customerName: 'Bob', amount: 200000, date: '2026-07-01', link: '' },
    ];
  });

  it('shows payment verification pending message (in Bahasa)', () => {
    renderStatus('INV-001');
    // The component uses "Payment berhasil dilakukan"
    expect(screen.getByText(/payment berhasil dilakukan/i)).toBeInTheDocument();
  });
});

describe('PublicStatus — PENDING invoice', () => {
  beforeEach(() => {
    mockInvoices = [
      { id: 'INV-001', description: 'Shoes', status: 'PENDING', customerName: 'Carol', amount: 300000, date: '2026-07-01', link: '' },
    ];
  });

  it('shows Menunggu Pembayaran (awaiting payment) heading', () => {
    renderStatus('INV-001');
    expect(screen.getByText(/menunggu pembayaran/i)).toBeInTheDocument();
  });

  it('shows Bayar Sekarang button for guest users', () => {
    mockUser = null;
    renderStatus('INV-001');
    expect(screen.getByRole('button', { name: /bayar sekarang/i })).toBeInTheDocument();
  });

  it('navigates to /pay/:id when Bayar Sekarang is clicked', () => {
    mockUser = null;
    renderStatus('INV-001');
    fireEvent.click(screen.getByRole('button', { name: /bayar sekarang/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/pay/INV-001');
  });

  it('shows Back to Dashboard for MERCHANT instead of Bayar Sekarang', () => {
    mockUser = { role: 'MERCHANT' };
    renderStatus('INV-001');
    expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /bayar sekarang/i })).not.toBeInTheDocument();
  });
});

describe('PublicStatus — FAILED/EXPIRED invoice', () => {
  it('shows Payment Failed heading for FAILED status', () => {
    mockInvoices = [
      { id: 'INV-001', description: 'Item', status: 'FAILED', customerName: 'Dave', amount: 100000, date: '2026-07-01', link: '' },
    ];
    renderStatus('INV-001');
    expect(screen.getByText(/payment failed/i)).toBeInTheDocument();
    expect(screen.getByText(/issue processing your payment/i)).toBeInTheDocument();
  });

  it('shows expired message for EXPIRED status', () => {
    mockInvoices = [
      { id: 'INV-001', description: 'Item', status: 'EXPIRED', customerName: 'Eve', amount: 100000, date: '2026-07-01', link: '' },
    ];
    renderStatus('INV-001');
    expect(screen.getByText(/payment time limit has expired/i)).toBeInTheDocument();
  });
});
