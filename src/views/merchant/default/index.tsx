import React, { useState } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Flex,
} from '@chakra-ui/react';

import { useGlobalData } from 'store/useGlobalData';

import InvoicesTable from '../invoiceTable';
import CreateInvoiceModal from '../modals/createInvoice';
import TopUpHistoryTable from '../topUpHistory';
import TopUpModal from '../modals/topUp';
import TransactionsTable from '../transactionTables';
import RequestRefundModal from '../modals/refundModal';


export default function MerchantDashboard() {
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const {
    isOpen: isInvoiceOpen,
    onOpen: onInvoiceOpen,
    onClose: onInvoiceClose,
  } = useDisclosure();
  const {
    isOpen: isTopUpOpen,
    onOpen: onTopUpOpen,
    onClose: onTopUpClose,
  } = useDisclosure();
  const {
    isOpen: isRefundOpen,
    onOpen: onRefundOpen,
    onClose: onRefundClose,
  } = useDisclosure();

  const [selectedTrxId, setSelectedTrxId] = useState<string | null>(null);

  const balance = useGlobalData((state) => state.balance);
  const invoices = useGlobalData((state) => state.invoices);
  const topUps = useGlobalData((state) => state.topUps);
  const transactions = useGlobalData((state) => state.transactions);

  const createInvoice = useGlobalData((state) => state.createInvoice);
  const requestTopUp = useGlobalData((state) => state.requestTopUp);
  const requestRefund = useGlobalData((state) => state.requestRefund);

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);

  const handleCreateInvoice = (data: any) => {
    createInvoice(data);
    toast({
      title: 'Payment Link Generated',
      status: 'success',
      duration: 3000,
    });
  };

  const handleRequestTopUp = (amount: number) => {
    requestTopUp(amount);
    toast({ title: 'Top-Up Requested', status: 'info', duration: 3000, position: 'top' });
  };

  const handleOpenRefundModal = (id: string) => {
    setSelectedTrxId(id);
    onRefundOpen();
  };

  const handleSubmitRefund = (reason: string) => {
    if (selectedTrxId) {
      requestRefund(selectedTrxId, reason);
      toast({
        title: 'Refund Requested',
        description: 'Pending Admin approval.',
        status: 'info',
        duration: 3000,
        position: 'top',
      });
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap="20px" mb="20px">
        <Box
          bg={cardBg}
          p={6}
          borderRadius="20px"
          border="1px solid"
          borderColor={borderColor}
        >
          <Text color="gray.500" fontSize="sm" mb={1}>
            Wallet Balance
          </Text>
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Text fontSize="2xl" fontWeight="bold" color="green.500">
              {formatIDR(balance)}
            </Text>
            <Button size="sm" colorScheme="green" onClick={onTopUpOpen}>
              + Request Top-Up
            </Button>
          </Flex>
        </Box>
      </SimpleGrid>

      <Box
        bg={cardBg}
        borderRadius="20px"
        p={6}
        border="1px solid"
        borderColor={borderColor}
      >
        <Tabs variant="soft-rounded" colorScheme="blue">
          <TabList mb={4} overflowX="auto" whiteSpace="nowrap">
            <Tab>Invoices</Tab>
            <Tab>Transactions</Tab>
            <Tab>Top-Up History</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0} pt={0}>
              <InvoicesTable invoices={invoices} onOpenCreate={onInvoiceOpen} />
            </TabPanel>
            <TabPanel px={0} pt={0}>
              <TransactionsTable
                transactions={transactions}
                onOpenRefund={handleOpenRefundModal}
              />
            </TabPanel>
            <TabPanel px={0} pt={0}>
              <TopUpHistoryTable topUps={topUps} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={isInvoiceOpen}
        onClose={onInvoiceClose}
        onCreate={handleCreateInvoice}
      />
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={onTopUpClose}
        onSubmit={handleRequestTopUp}
      />
      <RequestRefundModal
        isOpen={isRefundOpen}
        onClose={onRefundClose}
        onSubmit={handleSubmitRefund}
      />
    </Box>
  );
}
