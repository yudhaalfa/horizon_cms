import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Select,
  Input,
  HStack,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  Icon,
  Flex,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  VStack,
} from '@chakra-ui/react';
import {
  MdReceipt,
  MdTrendingUp,
  MdAutorenew,
  MdFilterList,
} from 'react-icons/md';

import { useGlobalData } from 'store/useGlobalData';

export default function AdminStatistics() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cardBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const invoices = useGlobalData((state) => state.invoices);
  const transactions = useGlobalData((state) => state.transactions);
  const refunds = useGlobalData((state) => state.refunds);

  const [tempMerchant, setTempMerchant] = useState('');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  const [appliedMerchant, setAppliedMerchant] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');

  const uniqueMerchants = useMemo(() => {
    const merchants = invoices.map(
      (inv: any) => inv.merchantName || 'Default Merchant',
    );
    return Array.from(new Set(merchants));
  }, [invoices]);

  const handleApplyFilter = () => {
    const todayStr = new Date().toISOString().split('T')[0];

    if (tempStartDate && tempStartDate < todayStr) {
      toast({
        title: 'Validasi Tanggal Gagal',
        description:
          'Tanggal mulai (Start Date) harus sama atau setelah hari ini (Date ≥ Today).',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    if (tempStartDate && tempEndDate && tempEndDate < tempStartDate) {
      toast({
        title: 'Validasi Tanggal Gagal',
        description:
          'Tanggal selesai (End Date) tidak boleh lebih awal dari Tanggal mulai.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    setAppliedMerchant(tempMerchant);
    setAppliedStartDate(tempStartDate);
    setAppliedEndDate(tempEndDate);

    toast({
      title: 'Filter Berhasil Diterapkan',
      status: 'success',
      duration: 2000,
      position: 'top',
    });

    onClose();
  };

  const handleResetFilter = () => {
    setTempMerchant('');
    setTempStartDate('');
    setTempEndDate('');
    setAppliedMerchant('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    onClose();
  };

  const filterByDateAndMerchant = useCallback(
    (item: any) => {
      const itemMerchant = item.merchantName || 'Default Merchant';
      if (appliedMerchant && itemMerchant !== appliedMerchant) return false;

      const itemDateStr = item.createdAt || item.date;
      if (itemDateStr) {
        const itemD = new Date(itemDateStr);
        const startD = appliedStartDate ? new Date(appliedStartDate) : null;
        const endD = appliedEndDate
          ? new Date(`${appliedEndDate}T23:59:59`)
          : null;

        if (startD && itemD < startD) return false;
        if (endD && itemD > endD) return false;
      }

      return true;
    },
    [appliedMerchant, appliedStartDate, appliedEndDate],
  );

  const filteredInvoices = useMemo(
    () => invoices.filter(filterByDateAndMerchant),
    [invoices, filterByDateAndMerchant],
  );

  const filteredTransactions = useMemo(
    () => transactions.filter(filterByDateAndMerchant),
    [transactions, filterByDateAndMerchant],
  );

  const filteredRefunds = useMemo(
    () => refunds.filter(filterByDateAndMerchant),
    [refunds, filterByDateAndMerchant],
  );

  const totalInvoices = filteredInvoices.length;
  const totalPaid = filteredInvoices.filter((i) => i.status === 'PAID').length;
  const totalFailed = filteredInvoices.filter(
    (i) => i.status === 'FAILED',
  ).length;
  const totalExpired = filteredInvoices.filter(
    (i) => i.status === 'EXPIRED',
  ).length;

  const totalNominalTrx = filteredTransactions
    .filter((t) => t.status === 'SUCCESS' || t.status === 'REFUNDED')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalNominalRefund = filteredRefunds
    .filter((r) => r.status === 'APPROVED')
    .reduce((sum, r) => sum + r.amount, 0);

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      {/* Header Filter Trigger Control */}
      <Flex
        bg={cardBg}
        p={5}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        mb={6}
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={4}
      >
        <Box>
          <Text fontWeight="bold" fontSize="lg">
            Statistik & Laporan
          </Text>
          <HStack spacing={2} mt={1}>
            <Text fontSize="xs" color="gray.500">
              Merchant: <b>{appliedMerchant || 'Semua Merchant'}</b>
            </Text>
            <Text fontSize="xs" color="gray.500">
              •
            </Text>
            <Text fontSize="xs" color="gray.500">
              Rentang Tanggal: <b>{appliedStartDate || 'Awal'}</b> s/d{' '}
              <b>{appliedEndDate || 'Sekarang'}</b>
            </Text>
          </HStack>
        </Box>

        <Button
          leftIcon={<Icon as={MdFilterList as any} />}
          colorScheme="blue"
          onClick={onOpen}
        >
          Atur Filter Tanggal & Merchant
        </Button>
      </Flex>

      {/* Grid Quick Stats Summary */}
      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={6} mb={6}>
        {/* Total Invoices */}
        <Box
          bg={cardBg}
          p={6}
          borderRadius="xl"
          border="1px solid"
          borderColor={borderColor}
        >
          <Flex align="center" justify="space-between">
            <Stat>
              <StatLabel color="gray.500">Total Invoices</StatLabel>
              <StatNumber fontSize="3xl">{totalInvoices}</StatNumber>
            </Stat>
            <Icon
              as={MdReceipt as any}
              w={10}
              h={10}
              color="blue.500"
              opacity={0.2}
            />
          </Flex>
          <HStack mt={4} spacing={4} fontSize="sm">
            <Text color="green.500" fontWeight="bold">
              {totalPaid} PAID
            </Text>
            <Text color="red.500" fontWeight="bold">
              {totalFailed} FAILED
            </Text>
            <Text color="orange.500" fontWeight="bold">
              {totalExpired} EXPIRED
            </Text>
          </HStack>
        </Box>

        {/* Transaction Volume */}
        <Box
          bg={cardBg}
          p={6}
          borderRadius="xl"
          border="1px solid"
          borderColor={borderColor}
        >
          <Flex align="center" justify="space-between">
            <Stat>
              <StatLabel color="gray.500">
                Transaction Volume (Success)
              </StatLabel>
              <StatNumber fontSize="2xl" color="green.500">
                {formatIDR(totalNominalTrx)}
              </StatNumber>
            </Stat>
            <Icon
              as={MdTrendingUp as any}
              w={10}
              h={10}
              color="green.500"
              opacity={0.2}
            />
          </Flex>
        </Box>

        {/* Refund Volume */}
        <Box
          bg={cardBg}
          p={6}
          borderRadius="xl"
          border="1px solid"
          borderColor={borderColor}
        >
          <Flex align="center" justify="space-between">
            <Stat>
              <StatLabel color="gray.500">Total Refunds (Approved)</StatLabel>
              <StatNumber fontSize="2xl" color="purple.500">
                {formatIDR(totalNominalRefund)}
              </StatNumber>
            </Stat>
            <Icon
              as={MdAutorenew as any}
              w={10}
              h={10}
              color="purple.500"
              opacity={0.2}
            />
          </Flex>
        </Box>
      </SimpleGrid>

      {/* Tabel Rincian Data Terfilter Sesuai Tanggal Dibuat */}
      <Box
        bg={cardBg}
        p={6}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
      >
        <Text fontWeight="bold" mb={4} fontSize="md">
          Daftar Invoice Terfilter ({filteredInvoices.length})
        </Text>
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID Invoice</Th>
                <Th>Pelanggan</Th>
                <Th>Tanggal Dibuat</Th>
                <Th>Nominal</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredInvoices.length === 0 ? (
                <Tr>
                  <Td colSpan={5} textAlign="center" color="gray.500" py={6}>
                    Tidak ada data invoice yang sesuai dengan rentang tanggal /
                    filter.
                  </Td>
                </Tr>
              ) : (
                filteredInvoices.map((inv: any) => (
                  <Tr key={inv.id}>
                    <Td fontWeight="bold">{inv.id}</Td>
                    <Td>{inv.customerName}</Td>
                    <Td>{formatDate(inv.createdAt || inv.date)}</Td>
                    <Td>{formatIDR(inv.amount)}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          inv.status === 'PAID'
                            ? 'green'
                            : inv.status === 'EXPIRED'
                              ? 'red'
                              : 'orange'
                        }
                      >
                        {inv.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Modal Filter Tanggal & Merchant */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay />
        <ModalContent borderRadius="20px">
          <ModalHeader fontWeight="bold">Filter Tanggal & Merchant</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  Merchant
                </Text>
                <Select
                  placeholder="Semua Merchant"
                  value={tempMerchant}
                  onChange={(e) => setTempMerchant(e.target.value)}
                >
                  {uniqueMerchants.map((m) => (
                    <option key={m} value={m as string}>
                      {m as string}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  Tanggal Mulai (Start Date ≥ Today)
                </Text>
                <Input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  Tanggal Selesai (End Date)
                </Text>
                <Input
                  type="date"
                  min={tempStartDate || new Date().toISOString().split('T')[0]}
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                />
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleResetFilter}>
              Reset
            </Button>
            <Button colorScheme="blue" onClick={handleApplyFilter}>
              Terapkan Filter
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
