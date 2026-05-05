import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  Flex,
  Tooltip,
  useColorModeValue,
  Icon,
  HStack,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { MdReceipt, MdContentCopy, MdPayment } from 'react-icons/md';

interface InvoicesTableProps {
  invoices: any[];
  onOpenCreate: () => void;
}

export default function InvoicesTable({
  invoices,
  onOpenCreate,
}: InvoicesTableProps) {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const toast = useToast();

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);

  const handleCopyLink = (id: string) => {
    const paymentUrl = `${window.location.origin}/pay/${id}`;
    navigator.clipboard.writeText(paymentUrl);
    toast({
      title: 'Link Copied!',
      status: 'success',
      duration: 2000,
      position: 'top',
    });
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          Generated Invoices
        </Text>
        <Button size="sm" colorScheme="blue" onClick={onOpenCreate}>
          + Create Invoice
        </Button>
      </Flex>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Invoice ID</Th>
              <Th>Date</Th>
              <Th>Customer</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {invoices.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center" color="gray.500" py={6}>
                  No invoices generated yet.
                </Td>
              </Tr>
            ) : (
              invoices.map((inv) => (
                <Tr key={inv.id}>
                  <Td fontWeight="bold">{inv.id}</Td>
                  <Td>{inv.date}</Td>
                  <Td>{inv.customerName}</Td>
                  <Td>{formatIDR(inv.amount)}</Td>
                  <Td>
                    <Badge
                      colorScheme={
                        inv.status === 'PAID'
                          ? 'green'
                          : inv.status === 'WAITING'
                            ? 'blue' // 🚨 NEW WAITING BADGE
                            : inv.status === 'PENDING'
                              ? 'orange'
                              : 'red'
                      }
                    >
                      {inv.status}
                    </Badge>
                  </Td>
                  <Td>
                    {inv.status === 'PAID' && (
                      <Button
                        as={RouterLink}
                        to={`/public-invoice/${inv.id}`}
                        size="sm"
                        colorScheme="blue"
                        variant="outline"
                        leftIcon={<Icon as={MdReceipt as any} />}
                      >
                        View Invoice
                      </Button>
                    )}

                    {/* 🚨 IF WAITING: Show a label instead of buttons */}
                    {inv.status === 'WAITING' && (
                      <Badge
                        colorScheme="blue"
                        variant="subtle"
                        p={2}
                        borderRadius="md"
                      >
                        ⏳ Verifying
                      </Badge>
                    )}

                    {inv.status === 'PENDING' && (
                      <HStack spacing={2}>
                        <Button
                          as={RouterLink}
                          to={`/pay/${inv.id}`}
                          size="sm"
                          colorScheme="blue"
                          leftIcon={<Icon as={MdPayment as any} />}
                        >
                          Pay
                        </Button>
                        <Tooltip label="Copy Link" placement="top">
                          <IconButton
                            aria-label="Copy"
                            icon={<Icon as={MdContentCopy as any} />}
                            size="sm"
                            colorScheme="gray"
                            variant="outline"
                            onClick={() => handleCopyLink(inv.id)}
                          />
                        </Tooltip>
                      </HStack>
                    )}

                    {(inv.status === 'EXPIRED' || inv.status === 'FAILED') && (
                      <Text color="gray.400" fontSize="sm">
                        -
                      </Text>
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
