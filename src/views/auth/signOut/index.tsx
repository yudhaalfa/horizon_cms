import React from 'react';
import {
  Flex,
  Button,
  Text,
  VStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdExitToApp } from 'react-icons/md';
import { useAuthStore } from 'store/useAuthStore';

export default function Logout() {
  const logout = useAuthStore((state) => state.logout);
  const bgColor = useColorModeValue('white', 'navy.800');

  const handleLogout = () => {
    // We don't even need useNavigate!
    // Firing this changes isAuthenticated to false.
    // Your Main.tsx will instantly detect this and throw you back to /auth/sign-in
    logout();
  };

  return (
    <Flex
      w="100%"
      pt={{ base: '130px', md: '100px', xl: '100px' }}
      align="center"
      justify="center"
    >
      <VStack
        spacing={6}
        bg={bgColor}
        p={10}
        borderRadius="20px"
        boxShadow="md"
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        textAlign="center"
      >
        <Icon as={MdExitToApp as any} w={16} h={16} color="red.500" />
        <Text fontSize="2xl" fontWeight="bold">
          Ready to leave?
        </Text>
        <Text color="gray.500">
          You are about to securely log out of your account.
        </Text>

        <Button
          colorScheme="red"
          size="lg"
          w="100%"
          mt={4}
          onClick={handleLogout}
        >
          Confirm Log Out
        </Button>
      </VStack>
    </Flex>
  );
}
