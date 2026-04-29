import React from 'react';
import {
  Flex,
  HStack,
  VStack,
  Icon,
  Text,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdAccountBalanceWallet, MdAdd } from 'react-icons/md';

interface WalletCardProps {
  balance: number;
  onOpenTopUp: () => void;
}

export default function WalletCard({ balance, onOpenTopUp }: WalletCardProps) {
  const cardBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('secondaryGray.900', 'white');

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(val);

  return (
    <Flex
      bg={cardBg}
      p={6}
      borderRadius="20px"
      border="1px solid"
      borderColor={borderColor}
      align="center"
      justify="space-between"
      boxShadow="sm"
      w="100%"
    >
      <HStack spacing={4}>
        <Flex
          w="56px"
          h="56px"
          bg="blue.50"
          borderRadius="full"
          align="center"
          justify="center"
        >
          <Icon
            as={MdAccountBalanceWallet as any}
            w="32px"
            h="32px"
            color="blue.500"
          />
        </Flex>
        <VStack align="start" spacing={0}>
          <Text color="gray.500" fontSize="sm" fontWeight="medium">
            Available Balance
          </Text>
          <Text color={textColor} fontSize="2xl" fontWeight="bold">
            {formatIDR(balance)}
          </Text>
        </VStack>
      </HStack>
      <Button
        colorScheme="blue"
        onClick={onOpenTopUp}
        leftIcon={<Icon as={MdAdd as any} />}
      >
        Top Up
      </Button>
    </Flex>
  );
}
