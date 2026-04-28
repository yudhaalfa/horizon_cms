import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Box, Container, Heading, Text, VStack, Button, useColorModeValue, Icon } from '@chakra-ui/react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function PaymentStatus() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');

  const isSuccess = status === 'success';
  const bgColor = useColorModeValue('white', 'navy.800');

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'navy.900')} py={20}>
      <Container maxW="md">
        <Box bg={bgColor} p={8} borderRadius="xl" boxShadow="md" textAlign="center">
          <VStack spacing={6}>
            <Icon 
              as={(isSuccess ? FaCheckCircle : FaTimesCircle as any)} 
              w={20} h={20} 
              color={isSuccess ? 'green.400' : 'red.400'} 
            />
            <Heading size="lg">{isSuccess ? 'Payment Successful' : 'Payment Failed'}</Heading>
            <Text color="gray.500">
              {isSuccess 
                ? `Thank you! Your transaction for order ${id} has been completed.` 
                : 'There was an issue processing your payment. Please try again.'}
            </Text>

            <VStack w="100%" spacing={3} mt={4}>
              {isSuccess && (
                <Button w="100%" colorScheme="blue" onClick={() => navigate(`/public-invoice/${id}`)}>
                  View Invoice
                </Button>
              )}
              <Button w="100%" variant="outline" onClick={() => navigate('/admin')}>
                Back to Dashboard
              </Button>
            </VStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
