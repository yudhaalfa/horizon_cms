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
  Button,
  useColorModeValue,
} from '@chakra-ui/react';

interface TransactionsTableProps {
  transactions: any[];
  onOpenRefund: (transactionId: string) => void;
}

export default function TransactionsTable({
  transactions,
  onOpenRefund,
}: TransactionsTableProps) {
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
        Transactions
      </Text>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Trx ID</Th>
              <Th>Date</Th>
              <Th>Customer</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {transactions.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center">
                  No transactions found.
                </Td>
              </Tr>
            ) : (
              transactions.map((trx) => (
                <Tr key={trx.id}>
                  <Td fontWeight="bold">{trx.id}</Td>
                  <Td>{trx.date}</Td>
                  <Td>{trx.customerName}</Td>
                  <Td>{formatIDR(trx.amount)}</Td>
                  <Td>
                    <Badge
                      colorScheme={
                        trx.status === 'SUCCESS'
                          ? 'green'
                          : trx.status === 'REFUNDED'
                            ? 'purple'
                            : trx.status === 'REFUND_PENDING'
                              ? 'orange'
                              : 'red'
                      }
                    >
                      {trx.status}
                    </Badge>
                  </Td>
                  <Td>
                    {/* Only show the refund button if the transaction was successful */}
                    {trx.status === 'SUCCESS' && (
                      <Button
                        size="sm"
                        colorScheme="orange"
                        variant="outline"
                        onClick={() => onOpenRefund(trx.id)}
                      >
                        Refund
                      </Button>
                    )}
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
