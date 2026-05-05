import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Text,
  VStack,
  useToast,
  Center,
  useColorModeValue,
  Link,
} from '@chakra-ui/react';
import { useAuthStore } from 'store/useAuthStore';

export default function SignIn() {
  const navigate = useNavigate();
  const toast = useToast();

  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const bgColor = useColorModeValue('white', 'navy.800');
  const pageBg = useColorModeValue('gray.50', 'navy.900');

  const handleLogin = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!email || !password) {
      toast({
        title: 'Please enter email and password',
        status: 'warning',
        duration: 2000,
      });
      return;
    }

    const isSuccess = login(email, password);

    if (isSuccess) {
      toast({ title: 'Login Successful', status: 'success', duration: 2000, position: 'top' });
      navigate('/');
    } else {
      toast({ title: 'Invalid credentials', status: 'error', duration: 3000 });
    }
  };

  return (
    <Center minH="100vh" bg={pageBg}>
      <Box bg={bgColor} p={8} borderRadius="xl" shadow="lg" maxW="md" w="full">
        <form onSubmit={handleLogin}>
          <VStack spacing={6} align="flex-start">
            <Box>
              <Heading size="lg" mb={2}>
                Sign In
              </Heading>
              <Text color="gray.500">
                Welcome back! Please enter your details.
              </Text>
            </Box>

            <FormControl isRequired>
              <FormLabel>Email Address</FormLabel>
              <Input
                type="email"
                placeholder="admin@srg.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>

            <Button type="submit" colorScheme="blue" w="full" size="lg">
              Sign In
            </Button>

            <Text fontSize="sm" textAlign="center" w="full">
              Don't have an account?{' '}
              <Link
                color="blue.500"
                fontWeight="bold"
                onClick={() => navigate('/register')}
              >
                Register as Merchant
              </Link>
            </Text>
          </VStack>
        </form>
      </Box>
    </Center>
  );
}
