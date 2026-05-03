import React from 'react';
import {
  Box,
  Text,
  Button,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdAutorenew } from 'react-icons/md';
import { Transaction } from 'store/useGlobalData';

interface TransactionsTableProps {
  transactions: Transaction[];
  onRequestRefund: (trx: Transaction) => void;
}

export default function TransactionsTable({
  transactions,
  onRequestRefund,
}: TransactionsTableProps) {
  const textColor = useColorModeValue('secondaryGray.900', 'white');

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(val);

  return (
    <Box>
      <Text fontSize="lg" fontWeight="bold" color={textColor} mb={6}>
        Transaction History
      </Text>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>TRX ID</Th>
              <Th>Date</Th>
              <Th>Customer</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {transactions.map((trx) => (
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
                        : trx.status === 'FAILED'
                          ? 'red'
                          : trx.status === 'REFUND_PENDING'
                            ? 'orange'
                            : 'gray'
                    }
                  >
                    {trx.status}
                  </Badge>
                </Td>
                <Td>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    isDisabled={
                      trx.status === 'REFUNDED' ||
                      trx.status === 'REFUND_PENDING'
                    }
                    onClick={() => onRequestRefund(trx)}
                    leftIcon={<Icon as={MdAutorenew as any} />}
                  >
                    Refund
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
