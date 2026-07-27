/**
 * Unit tests for useGlobalData store
 * Tests all state machine transitions: invoice lifecycle, payment intents,
 * refunds, top-ups, and balance arithmetic.
 * Run: npm run test:unit -- --testPathPattern=useGlobalData
 */

import { act } from 'react';
import { useGlobalData } from '../../store/useGlobalData';

const CLEAN_STATE = {
  balance: 10000000,
  invoices: [],
  transactions: [],
  refunds: [],
  topUps: [],
};

beforeEach(() => {
  act(() => {
    useGlobalData.setState(CLEAN_STATE);
  });
});

// ─── createInvoice ────────────────────────────────────────────────────────────

describe('createInvoice()', () => {
  const invoiceData = {
    customerName: 'Alice',
    description: 'Widget Pro',
    amount: 500000,
  };

  it('adds one invoice to state', () => {
    act(() => {
      useGlobalData.getState().createInvoice(invoiceData);
    });
    expect(useGlobalData.getState().invoices).toHaveLength(1);
  });

  it('generates an INV- prefixed id', () => {
    act(() => {
      useGlobalData.getState().createInvoice(invoiceData);
    });
    const invoice = useGlobalData.getState().invoices[0];
    expect(invoice.id).toMatch(/^INV-/);
  });

  it('sets status to PENDING', () => {
    act(() => {
      useGlobalData.getState().createInvoice(invoiceData);
    });
    expect(useGlobalData.getState().invoices[0].status).toBe('PENDING');
  });

  it('generates a payment link containing the invoice id', () => {
    act(() => {
      useGlobalData.getState().createInvoice(invoiceData);
    });
    const invoice = useGlobalData.getState().invoices[0];
    expect(invoice.link).toContain(invoice.id);
  });

  it('prepends new invoices (newest first)', () => {
    act(() => {
      useGlobalData.getState().createInvoice({ ...invoiceData, customerName: 'First' });
      useGlobalData.getState().createInvoice({ ...invoiceData, customerName: 'Second' });
    });
    expect(useGlobalData.getState().invoices[0].customerName).toBe('Second');
  });
});

// ─── createPaymentIntent ──────────────────────────────────────────────────────

describe('createPaymentIntent()', () => {
  let invoiceId: string;

  beforeEach(() => {
    act(() => {
      useGlobalData.getState().createInvoice({
        customerName: 'Bob',
        description: 'Keyboard',
        amount: 750000,
      });
    });
    invoiceId = useGlobalData.getState().invoices[0].id;
  });

  it('creates a WAITING transaction', () => {
    act(() => {
      useGlobalData.getState().createPaymentIntent(invoiceId, 'VA_DUMMY');
    });
    const trx = useGlobalData.getState().transactions[0];
    expect(trx.status).toBe('WAITING');
    expect(trx.method).toBe('VA_DUMMY');
    expect(trx.invoiceId).toBe(invoiceId);
  });

  it('transitions invoice to WAITING status', () => {
    act(() => {
      useGlobalData.getState().createPaymentIntent(invoiceId, 'VA_DUMMY');
    });
    const inv = useGlobalData.getState().invoices.find((i) => i.id === invoiceId);
    expect(inv?.status).toBe('WAITING');
  });

  it('is a no-op when invoice status is not PENDING', () => {
    act(() => {
      useGlobalData.getState().createPaymentIntent(invoiceId, 'VA_DUMMY');
      // second call — invoice is now WAITING, not PENDING
      useGlobalData.getState().createPaymentIntent(invoiceId, 'VA_DUMMY');
    });
    expect(useGlobalData.getState().transactions).toHaveLength(1);
  });
});

// ─── resolvePaymentIntent ─────────────────────────────────────────────────────

describe('resolvePaymentIntent()', () => {
  let invoiceId: string;
  let trxId: string;

  beforeEach(() => {
    act(() => {
      useGlobalData.getState().createInvoice({
        customerName: 'Carol',
        description: 'Monitor',
        amount: 2000000,
      });
    });
    invoiceId = useGlobalData.getState().invoices[0].id;
    act(() => {
      useGlobalData.getState().createPaymentIntent(invoiceId, 'CREDIT_CARD');
    });
    trxId = useGlobalData.getState().transactions[0].id;
  });

  it('marks transaction SUCCESS and invoice PAID on approval', () => {
    act(() => {
      useGlobalData.getState().resolvePaymentIntent(trxId, true);
    });
    const trx = useGlobalData.getState().transactions.find((t) => t.id === trxId);
    const inv = useGlobalData.getState().invoices.find((i) => i.id === invoiceId);
    expect(trx?.status).toBe('SUCCESS');
    expect(inv?.status).toBe('PAID');
  });

  it('adds invoice amount to balance on approval', () => {
    const before = useGlobalData.getState().balance;
    act(() => {
      useGlobalData.getState().resolvePaymentIntent(trxId, true);
    });
    expect(useGlobalData.getState().balance).toBe(before + 2000000);
  });

  it('marks transaction FAILED and invoice FAILED on rejection', () => {
    act(() => {
      useGlobalData.getState().resolvePaymentIntent(trxId, false);
    });
    const trx = useGlobalData.getState().transactions.find((t) => t.id === trxId);
    const inv = useGlobalData.getState().invoices.find((i) => i.id === invoiceId);
    expect(trx?.status).toBe('FAILED');
    expect(inv?.status).toBe('FAILED');
  });

  it('does not change balance on rejection', () => {
    const before = useGlobalData.getState().balance;
    act(() => {
      useGlobalData.getState().resolvePaymentIntent(trxId, false);
    });
    expect(useGlobalData.getState().balance).toBe(before);
  });

  it('is a no-op for non-WAITING transactions', () => {
    act(() => {
      useGlobalData.getState().resolvePaymentIntent(trxId, true);
      // trx is now SUCCESS, not WAITING
      useGlobalData.getState().resolvePaymentIntent(trxId, false);
    });
    const trx = useGlobalData.getState().transactions.find((t) => t.id === trxId);
    expect(trx?.status).toBe('SUCCESS');
  });
});

// ─── expireInvoice ────────────────────────────────────────────────────────────

describe('expireInvoice()', () => {
  let invoiceId: string;

  beforeEach(() => {
    act(() => {
      useGlobalData.getState().createInvoice({
        customerName: 'Dave',
        description: 'Headset',
        amount: 300000,
      });
    });
    invoiceId = useGlobalData.getState().invoices[0].id;
  });

  it('sets PENDING invoice to EXPIRED', () => {
    act(() => {
      useGlobalData.getState().expireInvoice(invoiceId);
    });
    const inv = useGlobalData.getState().invoices.find((i) => i.id === invoiceId);
    expect(inv?.status).toBe('EXPIRED');
  });

  it('does not expire a non-PENDING invoice', () => {
    act(() => {
      useGlobalData.getState().createPaymentIntent(invoiceId, 'VA_DUMMY');
      // invoice is now WAITING
      useGlobalData.getState().expireInvoice(invoiceId);
    });
    const inv = useGlobalData.getState().invoices.find((i) => i.id === invoiceId);
    expect(inv?.status).toBe('WAITING');
  });
});

// ─── requestTopUp ─────────────────────────────────────────────────────────────

describe('requestTopUp()', () => {
  it('adds a PENDING top-up entry', () => {
    act(() => {
      useGlobalData.getState().requestTopUp(500000);
    });
    const topUps = useGlobalData.getState().topUps;
    expect(topUps).toHaveLength(1);
    expect(topUps[0].status).toBe('PENDING');
    expect(topUps[0].amount).toBe(500000);
  });

  it('generates a TOP- prefixed id', () => {
    act(() => {
      useGlobalData.getState().requestTopUp(100000);
    });
    expect(useGlobalData.getState().topUps[0].id).toMatch(/^TOP-/);
  });
});

// ─── processTopUp ─────────────────────────────────────────────────────────────

describe('processTopUp()', () => {
  let topUpId: string;

  beforeEach(() => {
    act(() => {
      useGlobalData.getState().requestTopUp(1000000);
    });
    topUpId = useGlobalData.getState().topUps[0].id;
  });

  it('marks top-up SUCCESS and adds to balance on approval', () => {
    const before = useGlobalData.getState().balance;
    act(() => {
      useGlobalData.getState().processTopUp(topUpId, true);
    });
    expect(useGlobalData.getState().topUps[0].status).toBe('SUCCESS');
    expect(useGlobalData.getState().balance).toBe(before + 1000000);
  });

  it('marks top-up FAILED and leaves balance unchanged on rejection', () => {
    const before = useGlobalData.getState().balance;
    act(() => {
      useGlobalData.getState().processTopUp(topUpId, false);
    });
    expect(useGlobalData.getState().topUps[0].status).toBe('FAILED');
    expect(useGlobalData.getState().balance).toBe(before);
  });

  it('is a no-op for non-PENDING top-ups', () => {
    act(() => {
      useGlobalData.getState().processTopUp(topUpId, true);
      useGlobalData.getState().processTopUp(topUpId, false);
    });
    expect(useGlobalData.getState().topUps[0].status).toBe('SUCCESS');
  });
});

// ─── requestRefund + processRefund ───────────────────────────────────────────

describe('requestRefund() and processRefund()', () => {
  let trxId: string;
  let invoiceId: string;

  beforeEach(() => {
    act(() => {
      useGlobalData.getState().createInvoice({
        customerName: 'Eve',
        description: 'Shoes',
        amount: 450000,
      });
    });
    invoiceId = useGlobalData.getState().invoices[0].id;
    act(() => {
      useGlobalData.getState().createPaymentIntent(invoiceId, 'VA_DUMMY');
    });
    trxId = useGlobalData.getState().transactions[0].id;
    act(() => {
      useGlobalData.getState().resolvePaymentIntent(trxId, true);
    });
  });

  it('requestRefund creates a PENDING refund and marks trx REFUND PENDING', () => {
    act(() => {
      useGlobalData.getState().requestRefund(trxId, 'Wrong item');
    });
    const refunds = useGlobalData.getState().refunds;
    expect(refunds).toHaveLength(1);
    expect(refunds[0].status).toBe('PENDING');
    expect(refunds[0].transactionId).toBe(trxId);

    const trx = useGlobalData.getState().transactions.find((t) => t.id === trxId);
    expect(trx?.status).toBe('REFUND PENDING');
  });

  it('processRefund APPROVED deducts amount from balance and marks REFUNDED', () => {
    act(() => {
      useGlobalData.getState().requestRefund(trxId, 'Wrong item');
    });
    const refundId = useGlobalData.getState().refunds[0].id;
    const before = useGlobalData.getState().balance;

    act(() => {
      useGlobalData.getState().processRefund(refundId, true);
    });
    expect(useGlobalData.getState().refunds[0].status).toBe('APPROVED');
    const trx = useGlobalData.getState().transactions.find((t) => t.id === trxId);
    expect(trx?.status).toBe('REFUNDED');
    expect(useGlobalData.getState().balance).toBe(before - 450000);
  });

  it('processRefund REJECTED keeps balance and marks trx SUCCESS', () => {
    act(() => {
      useGlobalData.getState().requestRefund(trxId, 'Wrong item');
    });
    const refundId = useGlobalData.getState().refunds[0].id;
    const before = useGlobalData.getState().balance;

    act(() => {
      useGlobalData.getState().processRefund(refundId, false);
    });
    expect(useGlobalData.getState().refunds[0].status).toBe('REJECTED');
    const trx = useGlobalData.getState().transactions.find((t) => t.id === trxId);
    expect(trx?.status).toBe('SUCCESS');
    expect(useGlobalData.getState().balance).toBe(before);
  });
});

// ─── processPublicPayment ─────────────────────────────────────────────────────

describe('processPublicPayment()', () => {
  let invoiceId: string;

  beforeEach(() => {
    act(() => {
      useGlobalData.getState().createInvoice({
        customerName: 'Frank',
        description: 'Book',
        amount: 150000,
      });
    });
    invoiceId = useGlobalData.getState().invoices[0].id;
  });

  it('creates a SUCCESS transaction and marks invoice PAID', () => {
    act(() => {
      useGlobalData.getState().processPublicPayment(invoiceId);
    });
    const inv = useGlobalData.getState().invoices.find((i) => i.id === invoiceId);
    const trx = useGlobalData.getState().transactions[0];
    expect(inv?.status).toBe('PAID');
    expect(trx.status).toBe('SUCCESS');
  });

  it('adds amount to balance', () => {
    const before = useGlobalData.getState().balance;
    act(() => {
      useGlobalData.getState().processPublicPayment(invoiceId);
    });
    expect(useGlobalData.getState().balance).toBe(before + 150000);
  });

  it('is a no-op if already PAID', () => {
    act(() => {
      useGlobalData.getState().processPublicPayment(invoiceId);
      useGlobalData.getState().processPublicPayment(invoiceId);
    });
    expect(useGlobalData.getState().transactions).toHaveLength(1);
  });
});
