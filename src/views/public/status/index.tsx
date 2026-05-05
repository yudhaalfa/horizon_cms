import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  VStack,
  Heading,
  Text,
  Button,
  Icon,
  Center,
  useColorModeValue,
} from '@chakra-ui/react';

import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExclamationCircle,
} from 'react-icons/fa';

import { useGlobalData } from 'store/useGlobalData';
import { useAuthStore } from 'store/useAuthStore';

export default function PublicStatus() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const invoices = useGlobalData((state) => state.invoices);
  const transactions = useGlobalData((state) => state.transactions);
  const user = useAuthStore((state) => state.user);

  const invoice = invoices.find((inv) => inv.id === id);
  const transaction = transactions.find((t) => t.invoiceId === id);

  const bgColor = useColorModeValue('white', 'navy.800');
  const pageBg = useColorModeValue('gray.50', 'navy.900');

  if (!invoice) {
    return (
      <Center minH="100vh" bg={pageBg}>
        <VStack bg={bgColor} p={10} borderRadius="xl" shadow="sm" spacing={4}>
          <Icon as={FaTimesCircle as any} w={16} h={16} color="red.500" />
          <Heading size="md">Invoice Not Found</Heading>
          <Text color="gray.500">This invoice does not exist.</Text>
          {user?.role === 'MERCHANT' && (
            <Button
              mt={4}
              colorScheme="blue"
              onClick={() => navigate('/merchant/default')}
            >
              Back to Dashboard
            </Button>
          )}
        </VStack>
      </Center>
    );
  }

  if (invoice.status === 'PAID') {
    return (
      <Center minH="100vh" bg={pageBg}>
        <VStack
          bg={bgColor}
          p={10}
          borderRadius="xl"
          shadow="sm"
          spacing={4}
          textAlign="center"
          maxW="md"
        >
          <Icon as={FaCheckCircle as any} w={20} h={20} color="green.500" />
          <Heading size="lg" color="green.500">
            Payment Successful!
          </Heading>
          <Text color="gray.500">
            Thank you! Your payment for <b>{invoice.description}</b> has been
            verified.
          </Text>
          {user?.role === 'MERCHANT' ? (
            <Button
              mt={4}
              colorScheme="blue"
              onClick={() => navigate('/merchant/default')}
            >
              Back to Dashboard
            </Button>
          ) : (
            <Button mt={4} colorScheme="green" onClick={() => navigate('/')}>
              Close Window
            </Button>
          )}
        </VStack>
      </Center>
    );
  }

  if (invoice.status === 'WAITING' || transaction?.status === 'WAITING') {
    return (
      <Center minH="100vh" bg={pageBg}>
        <VStack
          bg={bgColor}
          p={10}
          borderRadius="xl"
          shadow="sm"
          spacing={4}
          textAlign="center"
          maxW="md"
        >
          <Icon as={FaClock as any} w={20} h={20} color="blue.500" />
          <Heading size="lg" color="blue.500">
            Menunggu Verifikasi
          </Heading>
          <Text color="gray.600" fontSize="md">
            <b>Pembayaran berhasil dilakukan</b>, sedang di proses pengecekan
            oleh admin.
          </Text>
          {user?.role === 'MERCHANT' && (
            <Button
              mt={4}
              colorScheme="blue"
              onClick={() => navigate('/merchant/default')}
            >
              Back to Dashboard
            </Button>
          )}
        </VStack>
      </Center>
    );
  }

  if (invoice.status === 'PENDING') {
    return (
      <Center minH="100vh" bg={pageBg}>
        <VStack
          bg={bgColor}
          p={10}
          borderRadius="xl"
          shadow="sm"
          spacing={4}
          textAlign="center"
          maxW="md"
        >
          <Icon
            as={FaExclamationCircle as any}
            w={20}
            h={20}
            color="orange.500"
          />
          <Heading size="lg" color="orange.500">
            Menunggu Pembayaran
          </Heading>
          <Text color="gray.600" fontSize="md">
            Tagihan ini belum dibayar. Silakan selesaikan pembayaran Anda.
          </Text>
          {user?.role === 'MERCHANT' ? (
            <Button
              mt={4}
              colorScheme="blue"
              onClick={() => navigate('/merchant/default')}
            >
              Back to Dashboard
            </Button>
          ) : (
            <Button
              mt={4}
              colorScheme="orange"
              onClick={() => navigate(`/pay/${invoice.id}`)}
            >
              Bayar Sekarang
            </Button>
          )}
        </VStack>
      </Center>
    );
  }

  return (
    <Center minH="100vh" bg={pageBg}>
      <VStack
        bg={bgColor}
        p={10}
        borderRadius="xl"
        shadow="sm"
        spacing={4}
        textAlign="center"
        maxW="md"
      >
        <Icon as={FaTimesCircle as any} w={20} h={20} color="red.500" />
        <Heading size="lg" color="red.500">
          Payment Failed
        </Heading>
        <Text color="gray.500">
          {invoice.status === 'EXPIRED'
            ? 'The payment time limit has expired.'
            : 'There was an issue processing your payment.'}
        </Text>
        {user?.role === 'MERCHANT' && (
          <Button
            mt={4}
            colorScheme="blue"
            onClick={() => navigate('/merchant/default')}
          >
            Back to Dashboard
          </Button>
        )}
      </VStack>
    </Center>
  );
}
