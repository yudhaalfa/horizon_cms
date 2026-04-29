import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
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

interface PaymentIntent {
  id: string;
  customer: string;
  amount: number;
  status: string;
}

interface PaymentSimulationProps {
  intents: PaymentIntent[];
  onSetStatus: (id: string, status: 'SUCCESS' | 'FAILED') => void;
}

export default function PaymentSimulation({
  intents,
  onSetStatus,
}: PaymentSimulationProps) {
  const [search, setSearch] = useState('');
  const textColor = useColorModeValue('secondaryGray.900', 'white');

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(val);

  const filteredIntents = search
    ? intents.filter((i) => i.id.toLowerCase().includes(search.toLowerCase()))
    : intents;

  return (
    <Box>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'start', md: 'center' }}
        mb={6}
        gap={4}
      >
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          Payment Intent Simulator
        </Text>
        <HStack w={{ base: '100%', md: '400px' }}>
          <Input
            placeholder="Search intent ID (e.g., PI-101)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </HStack>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Intent ID</Th>
              <Th>Customer</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Simulate Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredIntents.map((intent) => (
              <Tr key={intent.id}>
                <Td fontWeight="bold">{intent.id}</Td>
                <Td>{intent.customer}</Td>
                <Td>{formatIDR(intent.amount)}</Td>
                <Td>
                  <Badge
                    colorScheme={
                      intent.status === 'SUCCESS'
                        ? 'green'
                        : intent.status === 'FAILED'
                          ? 'red'
                          : 'orange'
                    }
                  >
                    {intent.status}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      colorScheme="green"
                      variant="outline"
                      isDisabled={intent.status !== 'PENDING'}
                      onClick={() => onSetStatus(intent.id, 'SUCCESS')}
                    >
                      Set Success
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      isDisabled={intent.status !== 'PENDING'}
                      onClick={() => onSetStatus(intent.id, 'FAILED')}
                    >
                      Set Failed
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
            {filteredIntents.length === 0 && (
              <Tr>
                <Td colSpan={5} textAlign="center" py={4}>
                  No payment intents found.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
