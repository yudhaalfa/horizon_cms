import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdErrorOutline } from 'react-icons/md';

export default function FailedPayment() {
  const bgColor = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('gray.700', 'white');

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'navy.900')} py={20}>
      <Container maxW="md">
        <VStack
          bg={bgColor}
          p={10}
          borderRadius="xl"
          boxShadow="sm"
          spacing={6}
          textAlign="center"
        >
          <Icon as={MdErrorOutline as any} w={20} h={20} color="red.500" />
          <Heading size="lg" color={textColor}>
            Pembayaran Gagal
          </Heading>
          <Text color="gray.500" fontSize="md">
            Waktu pembayaran telah habis atau terjadi kesalahan. Silahkan buat
            link pembayaran baru atau hubungi merchant.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
