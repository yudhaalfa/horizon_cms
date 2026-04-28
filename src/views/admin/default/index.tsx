import React, { useState } from 'react';
import {
  Box,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { MdReceipt, MdHistory } from 'react-icons/md';

// Child Components
import WalletCard from '../wallet';
import InvoicesTable from '../invoiceTable';
import TransactionsTable from '../transactionTables';
import TopUpModal from '../modals/topUp';
import CreateInvoiceModal from '../modals/createInvoice';
import RefundModal from '../modals/refundModal';

// Initial Mock Data
const initialTransactions = [
  {
    id: 'TRX-001',
    date: '2026-04-28',
    amount: 500000,
    status: 'Success',
    customer: 'John Doe',
  },
  {
    id: 'TRX-002',
    date: '2026-04-27',
    amount: 1500000,
    status: 'Success',
    customer: 'Jane Smith',
  },
  {
    id: 'TRX-003',
    date: '2026-04-26',
    amount: 750000,
    status: 'Refunded',
    customer: 'Bob Lee',
  },
];

const initialInvoices = [
  {
    id: 'INV-101',
    date: '2026-04-28',
    amount: 500000,
    status: 'Paid',
    link: 'https://pay.yourapp.com/INV-101',
  },
  {
    id: 'INV-102',
    date: '2026-04-29',
    amount: 2500000,
    status: 'Pending',
    link: 'https://pay.yourapp.com/INV-102',
  },
];

export default function MerchantDashboard() {
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Dashboard State
  const [balance, setBalance] = useState(12500000);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [transactions] = useState(initialTransactions);
  const [selectedTxForRefund, setSelectedTxForRefund] = useState<any>(null);

  // Modal Controls
  const topUpModal = useDisclosure();
  const createInvoiceModal = useDisclosure();
  const refundModal = useDisclosure();

  // Action Handlers
  const handleTopUpConfirm = (amount: number) => {
    setBalance((prev) => prev + amount);
    topUpModal.onClose();
    toast({ title: 'Top-up Successful', status: 'success', duration: 3000 });
  };

  const handleInvoiceCreate = (newInvoice: any) => {
    setInvoices([newInvoice, ...invoices]);
    createInvoiceModal.onClose();
    toast({ title: 'Invoice Created', status: 'success', duration: 3000 });
  };

  const handleRefundRequest = (trx: any) => {
    setSelectedTxForRefund(trx);
    refundModal.onOpen();
  };

  const submitRefundRequest = () => {
    refundModal.onClose();
    toast({
      title: 'Refund Requested',
      description: 'Our team will review this request.',
      status: 'info',
      duration: 4000,
    });
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* 1. Wallet Component */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px" mb="20px">
        <WalletCard balance={balance} onOpenTopUp={topUpModal.onOpen} />
      </SimpleGrid>

      {/* 2. Main Dashboard Tabs */}
      <Box
        bg={cardBg}
        borderRadius="20px"
        p={6}
        border="1px solid"
        borderColor={borderColor}
        boxShadow="sm"
      >
        <Tabs variant="soft-rounded" colorScheme="blue">
          <TabList mb={4}>
            <Tab>
              <Icon as={MdReceipt as any} mr={2} /> Invoices
            </Tab>
            <Tab>
              <Icon as={MdHistory as any} mr={2} /> Transactions & Refunds
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              <InvoicesTable
                invoices={invoices}
                onOpenCreate={createInvoiceModal.onOpen}
              />
            </TabPanel>

            <TabPanel px={0}>
              <TransactionsTable
                transactions={transactions}
                onRequestRefund={handleRefundRequest}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* 3. Modals */}
      <TopUpModal
        isOpen={topUpModal.isOpen}
        onClose={topUpModal.onClose}
        onConfirm={handleTopUpConfirm}
      />
      <CreateInvoiceModal
        isOpen={createInvoiceModal.isOpen}
        onClose={createInvoiceModal.onClose}
        onCreate={handleInvoiceCreate}
      />
      <RefundModal
        isOpen={refundModal.isOpen}
        onClose={refundModal.onClose}
        transaction={selectedTxForRefund}
        onSubmit={submitRefundRequest}
      />
    </Box>
  );
}
