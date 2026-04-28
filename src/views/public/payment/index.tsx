import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@chakra-ui/react';
import { FaQrcode, FaCreditCard, FaWallet } from 'react-icons/fa';

const mockOrder = {
  id: 'ORD-892341',
  description: 'Premium Plan Subscription (1 Year)',
  amount: 1500000,
};

export default function PublicPayment() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const bgColor = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'white');

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate API/Payment Gateway delay
    setTimeout(() => {
      setIsProcessing(false);
      // Redirect to status page, passing the order ID
      navigate(`/public-status/${mockOrder.id}?status=success`);
    }, 2000);
  };

  const isPayDisabled = tabIndex === 2 && !selectedWallet;

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'navy.900')} py={12}>
      <Container maxW="lg">
        <VStack spacing={8} w="100%">
          <VStack spacing={2} textAlign="center">
            <Heading size="xl" color={textColor}>
              Checkout
            </Heading>
          </VStack>

          {/* Order Summary */}
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
                <Text color="gray.500">Order ID</Text>
                <Text fontWeight="medium">{mockOrder.id}</Text>
              </HStack>
              <Divider my={2} />
              <HStack justify="space-between">
                <Text fontWeight="bold" fontSize="lg">
                  Total
                </Text>
                <Text fontWeight="bold" fontSize="2xl" color="blue.500">
                  {formatIDR(mockOrder.amount)}
                </Text>
              </HStack>
            </VStack>
          </Box>

          {/* Payment Methods */}
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
            Pay {formatIDR(mockOrder.amount)}
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}
