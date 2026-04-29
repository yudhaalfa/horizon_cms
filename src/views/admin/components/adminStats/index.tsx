import React from 'react';
import {
  Flex,
  HStack,
  VStack,
  Icon,
  Text,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdTrendingUp, MdAutorenew, MdCheckCircle } from 'react-icons/md';

interface AdminStatsProps {
  totalVolume: number;
  pendingRefunds: number;
  successRate: string;
}

export default function AdminStats({
  totalVolume,
  pendingRefunds,
  successRate,
}: AdminStatsProps) {
  const cardBg = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('secondaryGray.900', 'white');

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(val);

  const StatCard = ({ title, value, icon, iconColor, bgIcon }: any) => (
    <Flex
      bg={cardBg}
      p={6}
      borderRadius="20px"
      border="1px solid"
      borderColor={borderColor}
      align="center"
      boxShadow="sm"
    >
      <HStack spacing={4}>
        <Flex
          w="56px"
          h="56px"
          bg={bgIcon}
          borderRadius="full"
          align="center"
          justify="center"
        >
          <Icon as={icon} w="32px" h="32px" color={iconColor} />
        </Flex>
        <VStack align="start" spacing={0}>
          <Text color="gray.500" fontSize="sm" fontWeight="medium">
            {title}
          </Text>
          <Text color={textColor} fontSize="2xl" fontWeight="bold">
            {value}
          </Text>
        </VStack>
      </HStack>
    </Flex>
  );

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} gap="20px" mb="20px">
      <StatCard
        title="Total Volume (IDR)"
        value={formatIDR(totalVolume)}
        icon={MdTrendingUp as any}
        iconColor="blue.500"
        bgIcon="blue.50"
      />
      <StatCard
        title="Success Rate"
        value={successRate}
        icon={MdCheckCircle as any}
        iconColor="green.500"
        bgIcon="green.50"
      />
      <StatCard
        title="Pending Refunds"
        value={pendingRefunds}
        icon={MdAutorenew as any}
        iconColor="orange.500"
        bgIcon="orange.50"
      />
    </SimpleGrid>
  );
}
