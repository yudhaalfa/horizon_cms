import React from 'react';
import {
  Box,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  HStack,
} from '@chakra-ui/react';

interface Refund {
  id: string;
  trxId: string;
  merchant: string;
  amount: number;
  reason: string;
  status: string;
}

interface RefundManagementProps {
  refunds: Refund[];
  onProcessRefund: (id: string, action: 'APPROVE' | 'REJECT') => void;
}

export default function RefundManagement({
  refunds,
  onProcessRefund,
}: RefundManagementProps) {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(val);

  return (
    <Box>
      <Text fontSize="lg" fontWeight="bold" color={textColor} mb={6}>
        Refund Requests
      </Text>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Refund ID</Th>
              <Th>TRX ID</Th>
              <Th>Merchant</Th>
              <Th>Amount</Th>
              <Th>Reason</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {refunds.map((ref) => (
              <Tr key={ref.id}>
                <Td fontWeight="bold">{ref.id}</Td>
                <Td>{ref.trxId}</Td>
                <Td>{ref.merchant}</Td>
                <Td>{formatIDR(ref.amount)}</Td>
                <Td>{ref.reason}</Td>
                <Td>
                  <Badge
                    colorScheme={
                      ref.status === 'APPROVED'
                        ? 'green'
                        : ref.status === 'REJECTED'
                          ? 'red'
                          : 'orange'
                    }
                  >
                    {ref.status}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      colorScheme="green"
                      isDisabled={ref.status !== 'PENDING'}
                      onClick={() => onProcessRefund(ref.id, 'APPROVE')}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      isDisabled={ref.status !== 'PENDING'}
                      onClick={() => onProcessRefund(ref.id, 'REJECT')}
                    >
                      Reject
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
            {refunds.length === 0 && (
              <Tr>
                <Td colSpan={7} textAlign="center" py={4}>
                  No refund requests found.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
