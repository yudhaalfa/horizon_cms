import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useColorModeValue,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { FaPrint } from 'react-icons/fa';

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const bgColor = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('gray.700', 'white');

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'navy.900')} py={12}>
      <Container maxW="3xl">
        <HStack justify="flex-end" mb={4}>
          <Button
            leftIcon={<Icon as={FaPrint as React.ElementType} />}
            colorScheme="gray"
            variant="outline"
            onClick={() => window.print()}
          >
            Print Invoice
          </Button>
        </HStack>

        <Box
          bg={bgColor}
          p={10}
          borderRadius="xl"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
        >
          <HStack justify="space-between" align="flex-start" mb={8}>
            <VStack align="flex-start" spacing={1}>
              <Heading size="lg" color="blue.500">
                YourCompany
              </Heading>
              <Text color="gray.500" fontSize="sm">
                123 Business Road, Jakarta
              </Text>
              <Text color="gray.500" fontSize="sm">
                contact@yourcompany.com
              </Text>
            </VStack>
            <VStack align="flex-end" spacing={1}>
              <Heading size="md" color={textColor}>
                INVOICE
              </Heading>
              <Text fontWeight="bold">{id}</Text>
              <Badge colorScheme="green" px={3} py={1} mt={2} borderRadius="md">
                PAID
              </Badge>
            </VStack>
          </HStack>

          <Divider mb={8} />

          <HStack justify="space-between" mb={8} align="flex-start">
            <VStack align="flex-start" spacing={1}>
              <Text color="gray.500" fontSize="sm">
                Billed To:
              </Text>
              <Text fontWeight="bold">John Doe</Text>
              <Text color="gray.500" fontSize="sm">
                johndoe@email.com
              </Text>
            </VStack>
            <VStack align="flex-end" spacing={1}>
              <Text color="gray.500" fontSize="sm">
                Date Paid:
              </Text>
              <Text fontWeight="medium">{new Date().toLocaleDateString()}</Text>
            </VStack>
          </HStack>

          <Table variant="simple" size="sm" mb={8}>
            <Thead>
              <Tr>
                <Th>Description</Th>
                <Th isNumeric>Qty</Th>
                <Th isNumeric>Unit Price</Th>
                <Th isNumeric>Amount</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td py={4}>Premium Plan Subscription (1 Year)</Td>
                <Td isNumeric py={4}>
                  1
                </Td>
                <Td isNumeric py={4}>
                  Rp 1.500.000
                </Td>
                <Td isNumeric py={4} fontWeight="medium">
                  Rp 1.500.000
                </Td>
              </Tr>
              {/* Add more rows here if needed */}
            </Tbody>
          </Table>

          <VStack align="flex-end" spacing={2} w="100%">
            <HStack justify="space-between" w="250px">
              <Text color="gray.500">Subtotal</Text>
              <Text>Rp 1.500.000</Text>
            </HStack>
            <HStack justify="space-between" w="250px">
              <Text color="gray.500">Tax (0%)</Text>
              <Text>Rp 0</Text>
            </HStack>
            <Divider w="250px" />
            <HStack justify="space-between" w="250px">
              <Text fontWeight="bold" fontSize="lg">
                Total
              </Text>
              <Text fontWeight="bold" fontSize="lg" color="blue.500">
                Rp 1.500.000
              </Text>
            </HStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
