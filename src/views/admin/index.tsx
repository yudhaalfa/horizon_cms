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
import { MdPayment, MdAutorenew } from 'react-icons/md';

// 1. We import strictly from our new Admin wrapper!
import { useAdminStore } from 'store/useAdminStore';

export default function AdminControlPanel() {
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // 2. Pull exactly what the Admin is allowed to see and do
  const invoices = useAdminStore((state) => state.invoices);
  const refunds = useAdminStore((state) => state.refunds);
  const transactions = useAdminStore((state) => state.transactions);
  const simulatePayment = useAdminStore((state) => state.simulatePayment);
  const processRefund = useAdminStore((state) => state.processRefund);

  // 3. Filter data for the active panels
  const pendingInvoices = invoices.filter((inv) => inv.status === 'PENDING');
  const pendingRefunds = refunds.filter((ref) => ref.status === 'PENDING');

  // Dashboard Stats
  const totalVolume = transactions
    .filter((t) => t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(val);

  // 4. Action Handlers
  const handleSimulate = (id: string, isSuccess: boolean) => {
    simulatePayment(id, isSuccess);
    toast({
      title: `Payment ${isSuccess ? 'Success' : 'Failed'} Simulated`,
      status: isSuccess ? 'success' : 'error',
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

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      {/* STATS ROW */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap="20px" mb="20px">
        <Box
          bg={cardBg}
          p={6}
          borderRadius="20px"
          border="1px solid"
          borderColor={borderColor}
        >
          <Text color="gray.500" fontSize="sm">
            Total Trx Volume
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {formatIDR(totalVolume)}
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
            Total Successful Trx
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {transactions.filter((t) => t.status === 'SUCCESS').length}
          </Text>
        </Box>
      </SimpleGrid>

      {/* ADMIN CONTROLS TABS */}
      <Box
        bg={cardBg}
        borderRadius="20px"
        p={6}
        border="1px solid"
        borderColor={borderColor}
      >
        <Tabs variant="soft-rounded" colorScheme="blue">
          <TabList mb={4}>
            <Tab>
              <Icon as={MdPayment as any} mr={2} /> Payment Simulator
            </Tab>
            <Tab>
              <Icon as={MdAutorenew as any} mr={2} />
              Refund Management
              {pendingRefunds.length > 0 && (
                <Badge ml={2} colorScheme="red">
                  {pendingRefunds.length}
                </Badge>
              )}
            </Tab>
          </TabList>

          <TabPanels>
            {/* PAYMENT SIMULATOR PANEL */}
            <TabPanel px={0}>
              <Text mb={4} color="gray.500">
                Test payment webhooks by triggering success or failure states on
                pending invoices.
              </Text>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Invoice ID</Th>
                      <Th>Customer</Th>
                      <Th>Amount</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pendingInvoices.length === 0 ? (
                      <Tr>
                        <Td colSpan={4} textAlign="center">
                          No pending invoices to simulate.
                        </Td>
                      </Tr>
                    ) : (
                      pendingInvoices.map((inv) => (
                        <Tr key={inv.id}>
                          <Td fontWeight="bold">{inv.id}</Td>
                          <Td>{inv.customerName}</Td>
                          <Td>{formatIDR(inv.amount)}</Td>
                          <Td>
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                colorScheme="green"
                                onClick={() => handleSimulate(inv.id, true)}
                              >
                                Simulate Success
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                onClick={() => handleSimulate(inv.id, false)}
                              >
                                Simulate Fail
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
                        <Td colSpan={5} textAlign="center">
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
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}
