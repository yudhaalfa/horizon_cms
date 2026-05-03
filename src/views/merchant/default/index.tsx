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

// Zustand Store
import { useMerchantStore } from 'store/useMerchantStore';
import WalletCard from '../wallet';
import InvoicesTable from '../invoiceTable';
import TransactionsTable from '../transactionTables';
import TopUpModal from '../modals/topUp';
import CreateInvoiceModal from '../modals/createInvoice';
import RefundModal from '../modals/refundModal';

// Child Components

export default function MerchantDashboard() {
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const balance = useMerchantStore((state) => state.balance);
  const invoices = useMerchantStore((state) => state.invoices);
  const transactions = useMerchantStore((state) => state.transactions);
  const topUpWallet = useMerchantStore((state) => state.topUpWallet);
  const createInvoice = useMerchantStore((state) => state.createInvoice);
  const requestRefund = useMerchantStore((state) => state.requestRefund);

  const [selectedTxForRefund, setSelectedTxForRefund] = useState<any>(null);

  const topUpModal = useDisclosure();
  const createInvoiceModal = useDisclosure();
  const refundModal = useDisclosure();

  const handleTopUpConfirm = (amount: number) => {
    topUpWallet(amount);
    topUpModal.onClose();
    toast({ title: 'Top-up Successful', status: 'success', duration: 3000 });
  };

  const handleInvoiceCreate = (newInvoiceData: any) => {
    createInvoice(newInvoiceData);
    createInvoiceModal.onClose();
    toast({ title: 'Invoice Created', status: 'success', duration: 3000 });
  };

  const handleRefundRequestClick = (trx: any) => {
    setSelectedTxForRefund(trx);
    refundModal.onOpen();
  };

  const submitRefundRequest = (reason: string) => {
    if (selectedTxForRefund) {
      requestRefund(selectedTxForRefund.id, reason);
    }
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
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px" mb="20px">
        <WalletCard balance={balance} onOpenTopUp={topUpModal.onOpen} />
      </SimpleGrid>

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
                onRequestRefund={handleRefundRequestClick}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

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
