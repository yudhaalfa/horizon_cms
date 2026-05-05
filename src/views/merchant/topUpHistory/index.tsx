import React from 'react';
import {
  Box,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';

interface TopUpHistoryTableProps {
  topUps: any[];
}

export default function TopUpHistoryTable({ topUps }: TopUpHistoryTableProps) {
  const textColor = useColorModeValue('secondaryGray.900', 'white');

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);

  return (
    <Box>
      <Text fontSize="lg" fontWeight="bold" color={textColor} mb={6}>
        Top-Up History
      </Text>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Top-Up ID</Th>
              <Th>Date</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {topUps.length === 0 ? (
              <Tr>
                <Td colSpan={4} textAlign="center" py={6} color="gray.500">
                  No top-up history found.
                </Td>
              </Tr>
            ) : (
              topUps.map((topUp) => (
                <Tr key={topUp.id}>
                  <Td fontWeight="bold">{topUp.id}</Td>
                  <Td>{topUp.date}</Td>
                  <Td fontWeight="bold">{formatIDR(topUp.amount)}</Td>
                  <Td>
                    <Badge
                      colorScheme={
                        topUp.status === 'SUCCESS'
                          ? 'green'
                          : topUp.status === 'PENDING'
                            ? 'orange'
                            : 'red'
                      }
                    >
                      {topUp.status}
                    </Badge>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
