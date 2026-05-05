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
} from '@chakra-ui/react';
import { MdReceipt, MdTrendingUp, MdAutorenew } from 'react-icons/md';

import { useGlobalData } from 'store/useGlobalData';

export default function AdminStatistics() {
  const cardBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const invoices = useGlobalData((state) => state.invoices);
  const transactions = useGlobalData((state) => state.transactions);
  const refunds = useGlobalData((state) => state.refunds);

  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const uniqueMerchants = useMemo(() => {
    const merchants = invoices.map(
      (inv: any) => inv.merchantName || 'Default Merchant',
    );
    return Array.from(new Set(merchants));
  }, [invoices]);

  const filterByDateAndMerchant = useCallback(
    (item: any) => {
      const itemMerchant = item.merchantName || 'Default Merchant';
      if (selectedMerchant && itemMerchant !== selectedMerchant) return false;

      if (item.date) {
        const itemD = new Date(item.date);
        const startD = startDate ? new Date(startDate) : null;
        const endD = endDate ? new Date(endDate) : null;

        if (startD && itemD < startD) return false;
        if (endD && itemD > endD) return false;
      }

      return true;
    },
    [selectedMerchant, startDate, endDate],
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

  return (
    <Box>
      {/* FILTER BAR */}
      <Box
        bg={cardBg}
        p={5}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        mb={6}
      >
        <Text fontWeight="bold" mb={3}>
          Filter Data
        </Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          <Box>
            <Text fontSize="sm" color="gray.500" mb={1}>
              Merchant
            </Text>
            <Select
              placeholder="All Merchants"
              value={selectedMerchant}
              onChange={(e) => setSelectedMerchant(e.target.value)}
            >
              {uniqueMerchants.map((m) => (
                <option key={m} value={m as string}>
                  {m as string}
                </option>
              ))}
            </Select>
          </Box>
          <Box>
            <Text fontSize="sm" color="gray.500" mb={1}>
              Start Date
            </Text>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Box>
          <Box>
            <Text fontSize="sm" color="gray.500" mb={1}>
              End Date
            </Text>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Box>
        </SimpleGrid>
      </Box>

      {/* STATISTICS GRID */}
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
    </Box>
  );
}
