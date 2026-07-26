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

export default function Register() {
  const navigate = useNavigate();
  const toast = useToast();
  const register = useAuthStore((state) => state.register);

  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
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

    if (emailError) {
      setEmailError('');
    }
  };

  const handleRegister = (e?: React.FormEvent) => {
    e?.preventDefault();

    const normalizedName = name.trim();
    const normalizedStoreName = storeName.trim();
    const normalizedEmail = email.trim();

    if (
      !normalizedName ||
      !normalizedStoreName ||
      !normalizedEmail ||
      !password
    ) {
      toast({
        title: 'Please fill all fields',
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

    const isSuccess = register({
      name: normalizedName,
      storeName: normalizedStoreName,
      email: normalizedEmail,
      password,
      role: 'MERCHANT',
    });

    if (isSuccess) {
      toast({
        title: 'Registration Successful!',
        status: 'success',
        duration: 3000,
      });

      navigate('/merchant/default');
    } else {
      toast({
        title: 'Email already exists',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Center minH="100vh" bg={pageBg}>
      <Box
        bg={bgColor}
        p={8}
        borderRadius="xl"
        shadow="lg"
        maxW="md"
        w="full"
      >
        <form onSubmit={handleRegister} noValidate>
          <VStack spacing={6} align="flex-start">
            <Box>
              <Heading size="lg" mb={2}>
                Become a Merchant
              </Heading>

              <Text color="gray.500">
                Register your store to start receiving payments.
              </Text>
            </Box>

            <FormControl isRequired>
              <FormLabel>Full Name</FormLabel>

              <Input
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Store Name</FormLabel>

              <Input
                placeholder="Store name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired isInvalid={Boolean(emailError)}>
              <FormLabel>Email Address</FormLabel>

              <Input
                type="email"
                placeholder="Email address"
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

            <Button
              type="submit"
              colorScheme="blue"
              w="full"
              size="lg"
            >
              Create Account
            </Button>

            <Text fontSize="sm" textAlign="center" w="full">
              Already have an account?{' '}
              <Link
                color="blue.500"
                fontWeight="bold"
                onClick={() => navigate('/auth/sign-in')}
              >
                Log in here
              </Link>
            </Text>
          </VStack>
        </form>
      </Box>
    </Center>
  );
}
