import React from 'react';
import {
  Box,
  Flex,
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
import { MdAdd, MdOpenInNew } from 'react-icons/md';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: string;
  link: string;
}

interface InvoicesTableProps {
  invoices: Invoice[];
  onOpenCreate: () => void;
}

export default function InvoicesTable({
  invoices,
  onOpenCreate,
}: InvoicesTableProps) {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(val);

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          Recent Invoices
        </Text>
        <Button
          size="sm"
          colorScheme="blue"
          onClick={onOpenCreate}
          leftIcon={<Icon as={MdAdd as any} />}
        >
          Create Invoice
        </Button>
      </Flex>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Invoice ID</Th>
              <Th>Date</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {invoices.map((inv) => (
              <Tr key={inv.id}>
                <Td fontWeight="bold">{inv.id}</Td>
                <Td>{inv.date}</Td>
                <Td>{formatIDR(inv.amount)}</Td>
                <Td>
                  <Badge
                    colorScheme={inv.status === 'Paid' ? 'green' : 'orange'}
                  >
                    {inv.status}
                  </Badge>
                </Td>
                <Td>
                  <Button
                    size="sm"
                    variant="outline"
                    rightIcon={<Icon as={MdOpenInNew as any} />}
                    onClick={() =>
                      window.open(`/public-invoice/${inv.id}`, '_blank')
                    }
                  >
                    View Details
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
