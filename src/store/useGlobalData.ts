import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type InvoiceStatus = 'PENDING' | 'WAITING' | 'PAID' | 'EXPIRED' | 'FAILED';
export type TransactionStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'WAITING';
export type RefundStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type TopUpStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface TopUpRequest {
  id: string;
  amount: number;
  status: TopUpStatus;
  date: string;
}

export interface Invoice {
  id: string;
  customerName: string;
  amount: number;
  description: string;
  status: InvoiceStatus;
  date: string;
  link: string;
}
export interface Transaction {
  id: string;
  invoiceId: string;
  customerName: string;
  amount: number;
  status: TransactionStatus;
  date: string;
  method?: string;
}
export interface RefundRequest {
  id: string;
  transactionId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  date: string;
}

export interface DataState {
  balance: number;
  invoices: Invoice[];
  transactions: Transaction[];
  refunds: RefundRequest[];
  topUps: TopUpRequest[];
}

export interface MerchantActions {
  requestTopUp: (amount: number) => void;
  createInvoice: (data: {
    customerName: string;
    description: string;
    amount: number;
    merchantName?: string;
  }) => void;
  requestRefund: (transactionId: string, reason: string) => void;
  // Public
  createPaymentIntent: (invoiceId: string, method: string) => void;
  expireInvoice: (invoiceId: string) => void;
}

export interface AdminActions {
  simulatePayment: (invoiceId: string, isSuccess: boolean) => void;
  resolvePaymentIntent: (transactionId: string, isSuccess: boolean) => void;
  expireInvoice: (invoiceId: string) => void;
  processRefund: (refundId: string, isApproved: boolean) => void;
  processTopUp: (topUpId: string, isApproved: boolean) => void;
  processPublicPayment: (invoiceId: string) => void;
}

export type GlobalStore = DataState & MerchantActions & AdminActions;

// ==========================================
// Dummy Data
// ==========================================
const initialInvoices: Invoice[] = [
  {
    id: 'INV-1001',
    customerName: 'Budi Santoso',
    amount: 250000,
    description: 'Premium T-Shirt Black',
    status: 'PAID',
    date: '2026-04-25',
    link: 'https://pay.app/INV-1001',
  },
  {
    id: 'INV-1002',
    customerName: 'Siti Aminah',
    amount: 1500000,
    description: 'Mechanical Keyboard',
    status: 'PENDING',
    date: '2026-04-28',
    link: 'https://pay.app/INV-1002',
  },
];

const initialTransactions: Transaction[] = [
  {
    id: 'TRX-9001',
    invoiceId: 'INV-1001',
    customerName: 'Budi Santoso',
    amount: 250000,
    status: 'SUCCESS',
    date: '2026-04-25',
  },
  {
    id: 'TRX-9004',
    invoiceId: 'INV-0998',
    customerName: 'Toko Jaya',
    amount: 1200000,
    status: 'REFUNDED',
    date: '2026-04-15',
  },
];

const initialRefunds: RefundRequest[] = [
  {
    id: 'REF-5001',
    transactionId: 'TRX-9004',
    amount: 1200000,
    reason: 'Out of stock after payment',
    status: 'APPROVED',
    date: '2026-04-16',
  },
];

const initialTopUps: TopUpRequest[] = [];

export const useGlobalData = create<GlobalStore>()(
  persist(
    (set, get) => ({
      balance: 12500000,
      invoices: initialInvoices,
      transactions: initialTransactions,
      refunds: initialRefunds,
      topUps: initialTopUps,

      // MERCHANT ACTIONS
      requestTopUp: (amount: number) => {
        const newTopUp: TopUpRequest = {
          id: `TOP-${Math.floor(8000 + Math.random() * 1000)}`,
          amount: Number(amount),
          status: 'PENDING',
          date: new Date().toISOString().split('T')[0],
        };
        set((state) => ({
          topUps: [newTopUp, ...state.topUps],
        }));
      },
      
      createInvoice: (data) => {
        const timestampPart = Date.now().toString().slice(-6);
        const randomPart = Math.floor(100 + Math.random() * 900);
        const newId = `INV-${timestampPart}${randomPart}`;

        const newInvoice: Invoice = {
          ...data,
          id: newId,
          status: 'PENDING',
          date: new Date().toISOString().split('T')[0],
          link: `https://pay.yourapp.com/pay/${newId}`,
        };

        set((state) => ({ invoices: [newInvoice, ...state.invoices] }));
      },
      
      requestRefund: (transactionId, reason) => {
        const transaction = get().transactions.find(
          (t) => t.id === transactionId,
        );
        if (!transaction) return;

        const newRefund: RefundRequest = {
          id: `REF-${Math.floor(5000 + Math.random() * 4000)}`,
          transactionId,
          amount: transaction.amount,
          reason,
          status: 'PENDING',
          date: new Date().toISOString().split('T')[0],
        };

        set((state) => ({
          refunds: [newRefund, ...state.refunds],
          transactions: state.transactions.map((trx) =>
            trx.id === transactionId
              ? { ...trx, status: 'REFUND_PENDING' }
              : trx,
          ),
        }));
      },

      // ADMIN ACTIONS
      simulatePayment: (invoiceId, isSuccess) => {
        const invoice = get().invoices.find((i) => i.id === invoiceId);
        if (!invoice || invoice.status === 'PAID') return;
        
        const newTrx: Transaction = {
          id: `TRX-${Math.floor(9000 + Math.random() * 1000)}`,
          invoiceId,
          customerName: invoice.customerName,
          amount: invoice.amount,
          status: isSuccess ? 'SUCCESS' : 'FAILED',
          date: new Date().toISOString().split('T')[0],
        };
        
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === invoiceId
              ? { ...inv, status: isSuccess ? 'PAID' : 'FAILED' }
              : inv,
          ),
          transactions: [newTrx, ...state.transactions],
          balance: isSuccess
            ? Number(state.balance) + Number(invoice.amount)
            : state.balance,
        }));
      },
      
      processRefund: (refundId, isApproved) => {
        const refund = get().refunds.find((r) => r.id === refundId);
        if (!refund || refund.status !== 'PENDING') return;

        set((state) => ({
          refunds: state.refunds.map((r) =>
            r.id === refundId
              ? { ...r, status: isApproved ? 'APPROVED' : 'REJECTED' }
              : r,
          ),
          transactions: state.transactions.map((trx) =>
            trx.id === refund.transactionId
              ? { ...trx, status: isApproved ? 'REFUNDED' : 'SUCCESS' }
              : trx,
          ),
          balance: isApproved
            ? Number(state.balance) - Number(refund.amount)
            : state.balance,
        }));
      },
      
      processTopUp: (topUpId: string, isApproved: boolean) => {
        const topUp = get().topUps.find((t) => t.id === topUpId);
        if (!topUp || topUp.status !== 'PENDING') return;

        set((state) => ({
          topUps: state.topUps.map((t) =>
            t.id === topUpId
              ? { ...t, status: isApproved ? 'SUCCESS' : 'FAILED' }
              : t,
          ),
          balance: isApproved
            ? Number(state.balance) + Number(topUp.amount)
            : state.balance,
        }));
      },

      processPublicPayment: (invoiceId: string) => {
        const invoice = get().invoices.find((i) => i.id === invoiceId);
        if (!invoice || invoice.status === 'PAID') return;

        const newTrx: Transaction = {
          id: `TRX-${Math.floor(9000 + Math.random() * 1000)}`,
          invoiceId,
          customerName: invoice.customerName,
          amount: invoice.amount,
          status: 'SUCCESS',
          date: new Date().toISOString().split('T')[0],
        };

        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === invoiceId ? { ...inv, status: 'PAID' } : inv,
          ),
          transactions: [newTrx, ...state.transactions],
          balance: Number(state.balance) + Number(invoice.amount),
        }));
      },
      
      createPaymentIntent: (invoiceId, method) => {
        const invoice = get().invoices.find((i) => i.id === invoiceId);
        if (!invoice || invoice.status !== 'PENDING') return;

        const newTrx: Transaction = {
          id: `TRX-${Math.floor(9000 + Math.random() * 1000)}`,
          invoiceId,
          customerName: invoice.customerName,
          amount: invoice.amount,
          status: 'WAITING', 
          date: new Date().toISOString().split('T')[0],
          method,
        };

        set((state) => ({ 
          transactions: [newTrx, ...state.transactions],
          invoices: state.invoices.map((inv) =>
            inv.id === invoiceId ? { ...inv, status: 'WAITING' } : inv
          ),
        }));
      },

      resolvePaymentIntent: (transactionId, isSuccess) => {
        const trx = get().transactions.find((t) => t.id === transactionId);
        if (!trx || trx.status !== 'WAITING') return; 

        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === transactionId
              ? { ...t, status: isSuccess ? 'SUCCESS' : 'FAILED' }
              : t,
          ),

          invoices: state.invoices.map((inv) =>
              inv.id === trx.invoiceId 
                ? { ...inv, status: isSuccess ? 'PAID' : 'FAILED' } 
                : inv,
          ),

          balance: isSuccess
            ? Number(state.balance) + Number(trx.amount)
            : state.balance,
        }));
      },

      expireInvoice: (invoiceId) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === invoiceId && inv.status === 'PENDING'
              ? { ...inv, status: 'EXPIRED' }
              : inv,
          ),
        }));
      },
    }),
    { name: 'global-app-data' },
  ),
);
