/**
 * Unit tests for views/public/payment/index.tsx (PublicPayment)
 *
 * Tests: invalid link, paid/expired states, checkout rendering,
 * payment method tabs, and payment submission.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockCreatePaymentIntent = jest.fn();
const mockExpireInvoice = jest.fn();

// Helper to set up different invoice states
let mockInvoices: any[] = [];
let mockUser: any = null;

jest.mock('store/useGlobalData', () => ({
  useGlobalData: (selector: any) =>
    selector({
      invoices: mockInvoices,
      createPaymentIntent: mockCreatePaymentIntent,
      expireInvoice: mockExpireInvoice,
    }),
}));

jest.mock('store/useAuthStore', () => ({
  useAuthStore: (selector: any) => selector({ user: mockUser }),
}));

import PublicPayment from '../../../views/public/payment/index';

// Renders with token param
const renderPayment = (token = 'INV-TEST-01') =>
  render(
    <ChakraProvider>
      <MemoryRouter initialEntries={[`/pay/${token}`]}>
        <Routes>
          <Route path="/pay/:token" element={<PublicPayment />} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockUser = null;
});

afterEach(() => {
  jest.useRealTimers();
});

describe('PublicPayment — invalid link', () => {
  it('shows Invalid Payment Link when token does not match any invoice', () => {
    mockInvoices = [];
    renderPayment('NONEXISTENT');
    expect(screen.getByText(/invalid payment link/i)).toBeInTheDocument();
  });

  it('shows Go Back button on invalid link', () => {
    mockInvoices = [];
    renderPayment('NONEXISTENT');
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });
});

describe('PublicPayment — already PAID', () => {
  beforeEach(() => {
    mockInvoices = [
      {
        id: 'INV-TEST-01',
        customerName: 'Alice',
        amount: 500000,
        description: 'Widget',
        status: 'PAID',
        date: '2026-07-01',
        link: 'https://pay.app/INV-TEST-01',
      },
    ];
  });

  it('shows Payment Completed heading', () => {
    renderPayment('INV-TEST-01');
    expect(screen.getByText(/payment completed/i)).toBeInTheDocument();
  });

  it('shows Back to Dashboard button only for MERCHANT user', () => {
    mockUser = { role: 'MERCHANT' };
    renderPayment('INV-TEST-01');
    expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument();
  });

  it('does not show Back to Dashboard for guest users', () => {
    mockUser = null;
    renderPayment('INV-TEST-01');
    expect(screen.queryByRole('button', { name: /back to dashboard/i })).not.toBeInTheDocument();
  });
});

describe('PublicPayment — EXPIRED', () => {
  beforeEach(() => {
    mockInvoices = [
      {
        id: 'INV-TEST-01',
        customerName: 'Bob',
        amount: 200000,
        description: 'Keyboard',
        status: 'EXPIRED',
        date: '2026-07-01',
        link: 'https://pay.app/INV-TEST-01',
      },
    ];
  });

  it('shows Payment Expired heading', () => {
    renderPayment('INV-TEST-01');
    expect(screen.getByText(/payment expired/i)).toBeInTheDocument();
  });
});

describe('PublicPayment — PENDING (checkout page)', () => {
  beforeEach(() => {
    mockInvoices = [
      {
        id: 'INV-TEST-01',
        customerName: 'Carol',
        amount: 750000,
        description: 'Mechanical Keyboard',
        status: 'PENDING',
        date: '2026-07-01',
        link: 'https://pay.app/INV-TEST-01',
      },
    ];
  });

  it('renders Checkout heading', () => {
    renderPayment('INV-TEST-01');
    expect(screen.getByRole('heading', { name: /checkout/i })).toBeInTheDocument();
  });

  it('renders countdown timer', () => {
    renderPayment('INV-TEST-01');
    expect(screen.getByText(/03:00|complete payment in/i)).toBeInTheDocument();
  });

  it('renders Order Summary with invoice ID and description', () => {
    renderPayment('INV-TEST-01');
    expect(screen.getByText('INV-TEST-01')).toBeInTheDocument();
    expect(screen.getByText(/mechanical keyboard/i)).toBeInTheDocument();
  });

  it('renders payment method tabs: QRIS, Card, E-Wallet', () => {
    renderPayment('INV-TEST-01');
    expect(screen.getByText(/qris/i)).toBeInTheDocument();
    // Use getAllByText since "Card" / "E-Wallet" may appear in multiple places
    expect(screen.getAllByText(/^card$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/e-wallet/i).length).toBeGreaterThan(0);
  });

  it('renders Pay button with amount', () => {
    renderPayment('INV-TEST-01');
    expect(screen.getByRole('button', { name: /pay.*750\.000|pay.*750,000/i })).toBeInTheDocument();
  });

  it('calls createPaymentIntent and navigates to status page after payment', async () => {
    jest.useRealTimers();
    renderPayment('INV-TEST-01');
    fireEvent.click(screen.getByRole('button', { name: /pay/i }));

    // Wait for the 2s setTimeout inside handlePayment
    await waitFor(
      () => {
        expect(mockCreatePaymentIntent).toHaveBeenCalledWith('INV-TEST-01', 'VA_DUMMY');
      },
      { timeout: 3000 },
    );
    expect(mockNavigate).toHaveBeenCalledWith('/public-status/INV-TEST-01?status=pending');
  });

  it('expires invoice and navigates to /payment-failed when timer runs out', async () => {
    jest.useFakeTimers();
    renderPayment('INV-TEST-01');

    // Fast-forward 181 seconds (timer starts at 180)
    jest.advanceTimersByTime(181 * 1000);

    await waitFor(() => {
      expect(mockExpireInvoice).toHaveBeenCalledWith('INV-TEST-01');
    });
    expect(mockNavigate).toHaveBeenCalledWith('/payment-failed');
  });

  it('Pay button is disabled in E-Wallet tab until wallet is selected', () => {
    renderPayment('INV-TEST-01');
    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[tabs.length - 1]);
    // The main Pay button has amount in text; use a more specific query
    const payBtn = screen.getByRole('button', { name: /pay rp|pay.*750/i });
    expect(payBtn).toBeDisabled();
  });

  it('Pay button becomes enabled after selecting a wallet', () => {
    renderPayment('INV-TEST-01');
    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[tabs.length - 1]);
    fireEvent.click(screen.getByRole('button', { name: /^gopay$/i }));
    const payBtn = screen.getByRole('button', { name: /pay rp|pay.*750/i });
    expect(payBtn).not.toBeDisabled();
  });
});
