import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
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
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');

  const bgColor = useColorModeValue('white', 'navy.800');
  const pageBg = useColorModeValue('gray.50', 'navy.900');

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setEmail(value);

    // Hapus pesan error ketika pengguna mulai memperbaiki email
    if (emailError) {
      setEmailError('');
    }
  };

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      toast({
        title: 'Please enter email and password',
        status: 'warning',
        duration: 2000,
      });
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      setEmailError('Please enter a valid email address');

      toast({
        title: 'Invalid email format',
        description: 'Example: user@example.com',
        status: 'warning',
        duration: 3000,
      });

      return;
    }

    setEmailError('');

    const isSuccess = login(normalizedEmail, password);

    if (isSuccess) {
      toast({
        title: 'Login Successful',
        status: 'success',
        duration: 2000,
        position: 'top',
      });

      navigate('/');
    } else {
      toast({
        title: 'Invalid credentials',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Center minH="100vh" bg={pageBg}>
      <Box bg={bgColor} p={8} borderRadius="xl" shadow="lg" maxW="md" w="full">
        <form onSubmit={handleLogin} noValidate>
          <VStack spacing={6} align="flex-start">
            <Box>
              <Heading size="lg" mb={2}>
                Sign In
              </Heading>
            </Box>

            <FormControl isRequired isInvalid={Boolean(emailError)}>
              <FormLabel>Email Address</FormLabel>

              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
              />

              <FormErrorMessage>{emailError}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>

              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>

            <Button type="submit" colorScheme="blue" w="full" size="lg">
              Sign In
            </Button>

            <Text fontSize="sm" textAlign="center" w="full">
              Don&apos;t have an account?{' '}
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
