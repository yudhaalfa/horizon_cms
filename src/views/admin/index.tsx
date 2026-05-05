import React from 'react';
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
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Badge,
  HStack,
  useToast,
} from '@chakra-ui/react';
import {
  MdPayment,
  MdAutorenew,
  MdAccountBalanceWallet,
  MdTimer,
  MdBarChart,
} from 'react-icons/md';

import { useGlobalData } from 'store/useGlobalData';
import AdminStatistics from './components/adminStats';

export default function AdminControlPanel() {
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const invoices = useGlobalData((state) => state.invoices);
  const refunds = useGlobalData((state) => state.refunds);
  const transactions = useGlobalData((state) => state.transactions);
  const topUps = useGlobalData((state) => state.topUps);

  const resolvePaymentIntent = useGlobalData(
    (state) => state.resolvePaymentIntent,
  );
  const expireInvoice = useGlobalData((state) => state.expireInvoice);
  const processRefund = useGlobalData((state) => state.processRefund);
  const processTopUp = useGlobalData((state) => state.processTopUp);

  const pendingIntents = transactions.filter((t) => t.status === 'WAITING');
  const pendingInvoices = invoices.filter((inv) => inv.status === 'PENDING');
  const pendingRefunds = refunds.filter((ref) => ref.status === 'PENDING');
  const pendingTopUps = topUps?.filter((t) => t.status === 'PENDING') || [];

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);

  const handleResolveIntent = (id: string, isSuccess: boolean) => {
    resolvePaymentIntent(id, isSuccess);
    toast({
      title: `Payment Intent ${isSuccess ? 'Approved' : 'Rejected'}`,
      status: isSuccess ? 'success' : 'error',
      duration: 3000,
    });
  };

  const handleExpireInvoice = (id: string) => {
    expireInvoice(id);
    toast({
      title: 'Invoice Expired manually',
      status: 'warning',
      duration: 3000,
    });
  };

  const handleRefund = (id: string, isApproved: boolean) => {
    processRefund(id, isApproved);
    toast({
      title: `Refund ${isApproved ? 'Approved' : 'Rejected'}`,
      status: isApproved ? 'success' : 'warning',
      duration: 3000,
    });
  };

  const handleTopUpAction = (id: string, isApproved: boolean) => {
    processTopUp(id, isApproved);
    toast({
      title: `Top-up ${isApproved ? 'Approved' : 'Rejected'}`,
      status: isApproved ? 'success' : 'warning',
      duration: 3000,
    });
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* Quick Summary Row (Optional, keep or remove based on preference) */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap="20px" mb="20px">
        <Box
          bg={cardBg}
          p={6}
          borderRadius="20px"
          border="1px solid"
          borderColor={borderColor}
        >
          <Text color="gray.500" fontSize="sm">
            Action Needed
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="red.500">
            {pendingIntents.length +
              pendingRefunds.length +
              pendingTopUps.length}{' '}
            Pending Tasks
          </Text>
        </Box>
        <Box
          bg={cardBg}
          p={6}
          borderRadius="20px"
          border="1px solid"
          borderColor={borderColor}
        >
          <Text color="gray.500" fontSize="sm">
            Pending Refunds
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="orange.500">
            {pendingRefunds.length}
          </Text>
        </Box>
        <Box
          bg={cardBg}
          p={6}
          borderRadius="20px"
          border="1px solid"
          borderColor={borderColor}
        >
          <Text color="gray.500" fontSize="sm">
            Pending Top-Ups
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="blue.500">
            {pendingTopUps.length}
          </Text>
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
          <TabList mb={4} overflowX="auto" whiteSpace="nowrap" pb={2}>
            <Tab>
              <Icon as={MdBarChart as any} mr={2} /> Dashboard Stats
            </Tab>
            <Tab>
              <Icon as={MdPayment as any} mr={2} /> Payment
              {pendingIntents.length > 0 && (
                <Badge ml={2} colorScheme="green">
                  {pendingIntents.length}
                </Badge>
              )}
            </Tab>
            <Tab>
              <Icon as={MdTimer as any} mr={2} /> Expire Invoices
              {pendingInvoices.length > 0 && (
                <Badge ml={2} colorScheme="red">
                  {pendingInvoices.length}
                </Badge>
              )}
            </Tab>
            <Tab>
              <Icon as={MdAutorenew as any} mr={2} /> Refund Management
              {pendingRefunds.length > 0 && (
                <Badge ml={2} colorScheme="orange">
                  {pendingRefunds.length}
                </Badge>
              )}
            </Tab>
            <Tab>
              <Icon as={MdAccountBalanceWallet as any} mr={2} /> Top-Up Requests
              {pendingTopUps.length > 0 && (
                <Badge ml={2} colorScheme="blue">
                  {pendingTopUps.length}
                </Badge>
              )}
            </Tab>
          </TabList>

          <TabPanels>
            {/* STATISTICS PANEL */}
            <TabPanel px={0}>
              <AdminStatistics />
            </TabPanel>

            {/* PAYMENT SIMULATOR PANEL */}
            <TabPanel px={0}>
              <Box overflowX="auto">
                <Text mb={4} color="gray.500" fontSize="sm">
                  Transactions initiated by end-users. Approve them to mark the
                  invoice as PAID.
                </Text>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Trx ID</Th>
                      <Th>Invoice ID</Th>
                      <Th>Method</Th>
                      <Th>Amount</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pendingIntents.length === 0 ? (
                      <Tr>
                        <Td
                          colSpan={5}
                          textAlign="center"
                          color="gray.500"
                          py={4}
                        >
                          No pending payment intents.
                        </Td>
                      </Tr>
                    ) : (
                      pendingIntents.map((trx) => (
                        <Tr key={trx.id}>
                          <Td fontWeight="bold">{trx.id}</Td>
                          <Td>{trx.invoiceId}</Td>
                          <Td>
                            <Badge>{trx.method || 'UNKNOWN'}</Badge>
                          </Td>
                          <Td>{formatIDR(trx.amount)}</Td>
                          <Td>
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                colorScheme="green"
                                onClick={() =>
                                  handleResolveIntent(trx.id, true)
                                }
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                onClick={() =>
                                  handleResolveIntent(trx.id, false)
                                }
                              >
                                Reject
                              </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* EXPIRE INVOICES PANEL */}
            <TabPanel px={0}>
              <Box overflowX="auto">
                <Text mb={4} color="gray.500" fontSize="sm">
                  Force an invoice to expire to test your webhooks and failure
                  states.
                </Text>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Invoice ID</Th>
                      <Th>Customer</Th>
                      <Th>Amount</Th>
                      <Th>Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pendingInvoices.length === 0 ? (
                      <Tr>
                        <Td
                          colSpan={4}
                          textAlign="center"
                          color="gray.500"
                          py={4}
                        >
                          No pending invoices.
                        </Td>
                      </Tr>
                    ) : (
                      pendingInvoices.map((inv) => (
                        <Tr key={inv.id}>
                          <Td fontWeight="bold">{inv.id}</Td>
                          <Td>{inv.customerName}</Td>
                          <Td>{formatIDR(inv.amount)}</Td>
                          <Td>
                            <Button
                              size="sm"
                              colorScheme="orange"
                              variant="outline"
                              onClick={() => handleExpireInvoice(inv.id)}
                            >
                              Force Expire
                            </Button>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* REFUND MANAGEMENT PANEL */}
            <TabPanel px={0}>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Refund ID</Th>
                      <Th>Trx ID</Th>
                      <Th>Reason</Th>
                      <Th>Amount</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pendingRefunds.length === 0 ? (
                      <Tr>
                        <Td
                          colSpan={5}
                          textAlign="center"
                          color="gray.500"
                          py={4}
                        >
                          No pending refund requests.
                        </Td>
                      </Tr>
                    ) : (
                      pendingRefunds.map((ref) => (
                        <Tr key={ref.id}>
                          <Td fontWeight="bold">{ref.id}</Td>
                          <Td>{ref.transactionId}</Td>
                          <Td maxW="200px" isTruncated>
                            {ref.reason}
                          </Td>
                          <Td>{formatIDR(ref.amount)}</Td>
                          <Td>
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={() => handleRefund(ref.id, true)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleRefund(ref.id, false)}
                              >
                                Reject
                              </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* TOP-UP REQUESTS PANEL */}
            <TabPanel px={0}>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Top-Up ID</Th>
                      <Th>Date</Th>
                      <Th>Amount</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pendingTopUps.length === 0 ? (
                      <Tr>
                        <Td
                          colSpan={4}
                          textAlign="center"
                          color="gray.500"
                          py={4}
                        >
                          No pending top-up requests.
                        </Td>
                      </Tr>
                    ) : (
                      pendingTopUps.map((topUp) => (
                        <Tr key={topUp.id}>
                          <Td fontWeight="bold">{topUp.id}</Td>
                          <Td>{topUp.date}</Td>
                          <Td fontWeight="bold" color="blue.500">
                            {formatIDR(topUp.amount)}
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={() =>
                                  handleTopUpAction(topUp.id, true)
                                }
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() =>
                                  handleTopUpAction(topUp.id, false)
                                }
                              >
                                Reject
                              </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}
