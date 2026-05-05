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

export default function Register() {
  const navigate = useNavigate();
  const toast = useToast();
  const register = useAuthStore((state) => state.register);

  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const bgColor = useColorModeValue('white', 'navy.800');
  const pageBg = useColorModeValue('gray.50', 'navy.900');

  const handleRegister = () => {
    if (!name || !storeName || !email || !password) {
      toast({
        title: 'Please fill all fields',
        status: 'warning',
        duration: 2000,
      });
      return;
    }

    const isSuccess = register({
      name,
      storeName,
      email,
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
      toast({ title: 'Email already exists', status: 'error', duration: 3000 });
    }
  };

  return (
    <Center minH="100vh" bg={pageBg}>
      <Box bg={bgColor} p={8} borderRadius="xl" shadow="lg" maxW="md" w="full">
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
              placeholder="Yudo srg"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Store Name</FormLabel>
            <Input
              placeholder="srg Tech Store"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Email Address</FormLabel>
            <Input
              type="email"
              placeholder="merchant@srg.com"
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

          <Button
            colorScheme="blue"
            w="full"
            size="lg"
            onClick={handleRegister}
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
      </Box>
    </Center>
  );
}
