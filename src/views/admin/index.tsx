import React, { useState } from 'react';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import AdminStats from './components/adminStats';
import PaymentSimulation from './components/paymentSimulation';
import RefundManagement from './components/refundManagement';
import ConfirmationModal from './components/modal';

// Child Components

// Mock Data
const initialIntents = [
  { id: 'PI-101', customer: 'Budi Santoso', amount: 250000, status: 'PENDING' },
  { id: 'PI-102', customer: 'Siti Aminah', amount: 1500000, status: 'SUCCESS' },
  { id: 'PI-103', customer: 'Andi Wijaya', amount: 75000, status: 'PENDING' },
];

const initialRefunds = [
  {
    id: 'REF-001',
    trxId: 'TRX-892',
    merchant: 'Toko Baju A',
    amount: 250000,
    reason: 'Out of stock',
    status: 'PENDING',
  },
  {
    id: 'REF-002',
    trxId: 'TRX-112',
    merchant: 'Toko Sepatu B',
    amount: 800000,
    reason: 'Customer cancel',
    status: 'APPROVED',
  },
];

export default function AdminControlPanel() {
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // State
  const [intents, setIntents] = useState(initialIntents);
  const [refunds, setRefunds] = useState(initialRefunds);

  // Modal State
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalConfig, setModalConfig] = useState<any>({});

  // --- Handlers ---

  // 1. Triggered when Admin clicks Set Success/Failed in Simulation
  const handlePaymentSimulationClick = (
    id: string,
    status: 'SUCCESS' | 'FAILED',
  ) => {
    setModalConfig({
      title: `Confirm Payment ${status}`,
      message: `Are you sure you want to force status ${status} on Intent ${id}?`,
      confirmText: `Set ${status}`,
      colorScheme: status === 'SUCCESS' ? 'green' : 'red',
      onConfirm: () => {
        setIntents((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status } : i)),
        );
        toast({ title: `Payment marked as ${status}`, status: 'success' });
        onClose();
      },
    });
    onOpen();
  };

  // 2. Triggered when Admin clicks Approve/Reject in Refunds
  const handleRefundActionClick = (
    id: string,
    action: 'APPROVE' | 'REJECT',
  ) => {
    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    setModalConfig({
      title: `${action} Refund Request`,
      message: `Are you sure you want to ${action.toLowerCase()} refund request ${id}?`,
      confirmText: action,
      colorScheme: action === 'APPROVE' ? 'green' : 'red',
      onConfirm: () => {
        setRefunds((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
        );
        toast({
          title: `Refund ${newStatus}`,
          status: action === 'APPROVE' ? 'success' : 'info',
        });
        onClose();
      },
    });
    onOpen();
  };

  // Calculated Stats
  const pendingRefundsCount = refunds.filter(
    (r) => r.status === 'PENDING',
  ).length;

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* 1. Statistics Module */}
      <AdminStats
        totalVolume={1455000000}
        successRate="98.2%"
        pendingRefunds={pendingRefundsCount}
      />

      {/* 2. Admin Operational Tabs */}
      <Box
        bg={cardBg}
        borderRadius="20px"
        p={6}
        border="1px solid"
        borderColor={borderColor}
        boxShadow="sm"
      >
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList mb={4}>
            <Tab fontWeight="medium">Payment Simulation</Tab>
            <Tab fontWeight="medium">
              Refunds {pendingRefundsCount > 0 && `(${pendingRefundsCount})`}
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              <PaymentSimulation
                intents={intents}
                onSetStatus={handlePaymentSimulationClick}
              />
            </TabPanel>

            <TabPanel px={0}>
              <RefundManagement
                refunds={refunds}
                onProcessRefund={handleRefundActionClick}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Global Confirmation Modal for Admin Actions */}
      <ConfirmationModal isOpen={isOpen} onClose={onClose} {...modalConfig} />
    </Box>
  );
}
