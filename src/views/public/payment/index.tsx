import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Divider,
  useColorModeValue,
  Icon,
  Image,
  SimpleGrid,
  Center,
} from '@chakra-ui/react';
import { FaQrcode, FaCreditCard, FaWallet, FaClock } from 'react-icons/fa';

import { useGlobalData } from 'store/useGlobalData';
import { useAuthStore } from 'store/useAuthStore';

export default function PublicPayment() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { token } = useParams<{ token: string }>();

  const invoices = useGlobalData((state) => state.invoices);
  const createPaymentIntent = useGlobalData(
    (state) => state.createPaymentIntent,
  );
  const expireInvoice = useGlobalData((state) => state.expireInvoice);

  const [isProcessing, setIsProcessing] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(180);

  const bgColor = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'white');
  const pageBg = useColorModeValue('gray.50', 'navy.900');

  const realInvoice = invoices.find((inv) => inv.link.endsWith(token || ''));

  const invoiceId = realInvoice?.id;
  const invoiceStatus = realInvoice?.status;

  useEffect(() => {
    if (!invoiceId || invoiceStatus !== 'PENDING') return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          expireInvoice(invoiceId);
          navigate('/payment-failed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [invoiceId, invoiceStatus, expireInvoice, navigate]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePayment = () => {
    if (!realInvoice) return;
    setIsProcessing(true);

    let method = 'VA_DUMMY';
    if (tabIndex === 1) method = 'CREDIT_CARD';
    if (tabIndex === 2) method = `EWALLET_DUMMY (${selectedWallet})`;

    setTimeout(() => {
      createPaymentIntent(realInvoice.id, method);
      setIsProcessing(false);
      navigate(`/public-status/${realInvoice.id}?status=pending`);
    }, 2000);
  };

  if (!realInvoice) {
    return (
      <Center minH="100vh" bg={pageBg}>
        <VStack bg={bgColor} p={10} borderRadius="xl" shadow="sm" spacing={4}>
          <Heading size="md" color="red.500">
            Invalid Payment Link
          </Heading>
          <Text color="gray.500">This link is invalid or does not exist.</Text>
          <Button
            mt={4}
            colorScheme="blue"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </VStack>
      </Center>
    );
  }

  if (realInvoice.status === 'PAID') {
    return (
      <Center minH="100vh" bg={pageBg}>
        <VStack bg={bgColor} p={10} borderRadius="xl" shadow="sm" spacing={4}>
          <Heading size="md" color="green.500">
            Payment Completed
          </Heading>
          <Text color="gray.500">
            This invoice has already been paid successfully.
          </Text>

          {/* Show button ONLY if the user is a logged-in Merchant */}
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

  if (realInvoice.status === 'EXPIRED') {
    return (
      <Center minH="100vh" bg={pageBg}>
        <VStack
          bg={bgColor}
          p={10}
          borderRadius="xl"
          shadow="sm"
          spacing={4}
          textAlign="center"
        >
          <Heading size="md" color="orange.500">
            Payment Expired
          </Heading>
          <Text color="gray.500">
            The time limit for this payment link has passed.
            <br />
            Please contact the merchant for a new link.
          </Text>

          {/* Show button ONLY if the user is a logged-in Merchant */}
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

  const isPayDisabled = tabIndex === 2 && !selectedWallet;

  return (
    <Box minH="100vh" bg={pageBg} py={12}>
      <Container maxW="lg">
        <VStack spacing={8} w="100%">
          <VStack spacing={2} textAlign="center">
            <Heading size="xl" color={textColor}>
              Checkout
            </Heading>
            <HStack color="orange.500" fontWeight="bold">
              <Icon as={FaClock as any} />
              <Text>Complete payment in: {formatTime(timeLeft)}</Text>
            </HStack>
          </VStack>

          <Box
            w="100%"
            bg={bgColor}
            p={6}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
          >
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold" fontSize="lg">
                Order Summary
              </Text>
              <HStack justify="space-between">
                <Text color="gray.500">Invoice ID</Text>
                <Text fontWeight="medium">{realInvoice.id}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text color="gray.500">Item</Text>
                <Text fontWeight="medium" textAlign="right">
                  {realInvoice.description}
                </Text>
              </HStack>
              <Divider my={2} />
              <HStack justify="space-between">
                <Text fontWeight="bold" fontSize="lg">
                  Total
                </Text>
                <Text fontWeight="bold" fontSize="2xl" color="blue.500">
                  {formatIDR(realInvoice.amount)}
                </Text>
              </HStack>
            </VStack>
          </Box>

          <Box
            w="100%"
            bg={bgColor}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
          >
            <Tabs
              isFitted
              variant="enclosed"
              index={tabIndex}
              onChange={setTabIndex}
            >
              <TabList mb="1em">
                <Tab py={4}>
                  <VStack spacing={1}>
                    <Icon as={FaQrcode as any} />
                    <Text fontSize="sm">QRIS</Text>
                  </VStack>
                </Tab>
                <Tab py={4}>
                  <VStack spacing={1}>
                    <Icon as={FaCreditCard as any} />
                    <Text fontSize="sm">Card</Text>
                  </VStack>
                </Tab>
                <Tab py={4}>
                  <VStack spacing={1}>
                    <Icon as={FaWallet as any} />
                    <Text fontSize="sm">E-Wallet</Text>
                  </VStack>
                </Tab>
              </TabList>

              <TabPanels p={4}>
                <TabPanel>
                  <VStack spacing={6}>
                    <Text textAlign="center" fontSize="sm">
                      Scan this QR Code
                    </Text>
                    <Image
                      src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DummyQRIS"
                      boxSize="200px"
                    />
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Card Number</FormLabel>
                      <Input placeholder="0000 0000 0000 0000" />
                    </FormControl>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="sm" mb={2}>
                      Select your preferred e-wallet.
                    </Text>
                    <SimpleGrid columns={2} spacing={4}>
                      {['GoPay', 'OVO', 'DANA', 'ShopeePay'].map((wallet) => (
                        <Button
                          key={wallet}
                          variant={
                            selectedWallet === wallet ? 'solid' : 'outline'
                          }
                          colorScheme={
                            selectedWallet === wallet ? 'blue' : 'gray'
                          }
                          height="60px"
                          onClick={() => setSelectedWallet(wallet)}
                        >
                          {wallet}
                        </Button>
                      ))}
                    </SimpleGrid>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>

          <Button
            w="100%"
            colorScheme="blue"
            size="lg"
            height="60px"
            isLoading={isProcessing}
            onClick={handlePayment}
            isDisabled={isPayDisabled}
          >
            Pay {formatIDR(realInvoice.amount)}
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}
