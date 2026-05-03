import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type InvoiceStatus = 'PENDING' | 'PAID' | 'EXPIRED';
export type TransactionStatus =
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED';
export type RefundStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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
}

export interface MerchantActions {
  topUpWallet: (amount: number) => void;
  createInvoice: (
    data: Omit<Invoice, 'id' | 'status' | 'date' | 'link'>,
  ) => void;
  requestRefund: (transactionId: string, reason: string) => void;
}

export interface AdminActions {
  simulatePayment: (invoiceId: string, isSuccess: boolean) => void;
  processRefund: (refundId: string, isApproved: boolean) => void;
}

export type GlobalStore = DataState & MerchantActions & AdminActions;

// ==========================================
// 3. Dummy Data
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

// ==========================================
// 4. The Global Store
// ==========================================
export const useGlobalData = create<GlobalStore>()(
  persist(
    (set, get) => ({
      // STATE
      balance: 12500000,
      invoices: initialInvoices,
      transactions: initialTransactions,
      refunds: initialRefunds,

      // MERCHANT ACTIONS
      topUpWallet: (amount) =>
        set((state) => ({ balance: Number(state.balance) + Number(amount) })),
      createInvoice: (data) => {
        const newId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
        const newInvoice: Invoice = {
          ...data,
          id: newId,
          status: 'PENDING',
          date: new Date().toISOString().split('T')[0],
          link: `https://pay.yourapp.com/${newId}`,
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
          balance: Number(state.balance) - Number(transaction.amount),
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
              ? { ...inv, status: isSuccess ? 'PAID' : inv.status }
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
          balance: !isApproved
            ? Number(state.balance) + Number(refund.amount)
            : state.balance,
        }));
      },
    }),
    { name: 'global-app-data' },
  ),
);
