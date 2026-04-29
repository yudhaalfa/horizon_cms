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

interface Transaction {
  id: string;
  date: string;
  amount: number;
  status: string;
  customer: string;
}

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
                <Td>{trx.customer}</Td>
                <Td>{formatIDR(trx.amount)}</Td>
                <Td>
                  <Badge
                    colorScheme={trx.status === 'Success' ? 'green' : 'red'}
                  >
                    {trx.status}
                  </Badge>
                </Td>
                <Td>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    isDisabled={trx.status === 'Refunded'}
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
