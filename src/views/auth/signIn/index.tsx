/* eslint-disable */
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
// Chakra imports
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
// Custom components
import { HSeparator } from "components/separator/Separator";
import DefaultAuth from "layouts/auth/Default";
// Assets
import illustration from "assets/img/auth/auth.png";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";

// Import your Zustand store
import { useAuthStore } from "store/useAuthStore";

function SignIn() {
  // Chakra color mode
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const textColorDetails = useColorModeValue("navy.700", "secondaryGray.600");
  const textColorBrand = useColorModeValue("brand.500", "white");
  const brandStars = useColorModeValue("brand.500", "brand.400");
  const googleBg = useColorModeValue("secondaryGray.300", "whiteAlpha.200");
  const googleText = useColorModeValue("navy.700", "white");
  const googleHover = useColorModeValue({ bg: "gray.200" }, { bg: "whiteAlpha.300" });
  const googleActive = useColorModeValue({ bg: "secondaryGray.300" }, { bg: "whiteAlpha.200" });
  
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  // --- Auth Logic State ---
  const navigate = useNavigate();
  const toast = useToast();
  const login = useAuthStore((state) => state.login);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API Call
    setTimeout(() => {
      setIsLoading(false);

      // Mock Admin Login
      if (email === "admin@test.com" && password === "a123") {
        login({ id: "A-001", name: "Super Admin", email, role: "admin" }, "mock-admin-token");
        toast({ title: "Welcome back, Admin!", status: "success", duration: 3000 });
        navigate("/admin/default"); // Adjust this to your actual Admin route
      } 
      // Mock Merchant Login
      else if (email === "merchant@test.com" && password === "m123") {
        login({ id: "M-102", name: "Toko Baju A", email, role: "merchant" }, "mock-merchant-token");
        toast({ title: "Welcome back, Merchant!", status: "success", duration: 3000 });
        navigate("/admin/merchant-dashboard"); // Adjust this to where you put the Merchant Dashboard
      } 
      // Error
      else {
        toast({ 
          title: "Invalid Credentials", 
          description: "Try admin@test.com (admin123) or merchant@test.com (merchant123)", 
          status: "error", 
          duration: 5000 
        });
      }
    }, 1200);
  };

  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        maxW={{ base: "100%", md: "max-content" }}
        w='100%'
        mx={{ base: "auto", lg: "0px" }}
        me='auto'
        h='100%'
        alignItems='start'
        justifyContent='center'
        mb={{ base: "30px", md: "60px" }}
        px={{ base: "25px", md: "0px" }}
        mt={{ base: "40px", md: "14vh" }}
        flexDirection='column'>
        <Box me='auto'>
          <Heading color={textColor} fontSize='36px' mb='10px'>
            Sign In
          </Heading>
          <Text mb='36px' ms='4px' color={textColorSecondary} fontWeight='400' fontSize='md'>
            Enter your email and password to sign in!
          </Text>
        </Box>
        <Flex
          zIndex='2'
          direction='column'
          w={{ base: "100%", md: "420px" }}
          maxW='100%'
          background='transparent'
          borderRadius='15px'
          mx={{ base: "auto", lg: "unset" }}
          me='auto'
          mb={{ base: "20px", md: "auto" }}>
          
          <Button
            fontSize='sm' me='0px' mb='26px' py='15px' h='50px' borderRadius='16px'
            bg={googleBg} color={googleText} fontWeight='500'
            _hover={googleHover} _active={googleActive} _focus={googleActive}>
            <Icon as={FcGoogle as any} w='20px' h='20px' me='10px' />
            Sign in with Google
          </Button>
          
          <Flex align='center' mb='25px'>
            <HSeparator />
            <Text color='gray.400' mx='14px'>or</Text>
            <HSeparator />
          </Flex>

          {/* Form wrapper for Enter key submission */}
          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            <FormControl>
              <FormLabel display='flex' ms='4px' fontSize='sm' fontWeight='500' color={textColor} mb='8px'>
                Email<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                isRequired
                variant='auth' fontSize='sm' ms={{ base: "0px", md: "0px" }}
                type='email' placeholder='mail@simmmple.com' mb='24px' fontWeight='500' size='lg'
                value={email} onChange={(e) => setEmail(e.target.value)}
              />

              <FormLabel ms='4px' fontSize='sm' fontWeight='500' color={textColor} display='flex'>
                Password<Text color={brandStars}>*</Text>
              </FormLabel>
              <InputGroup size='md'>
                <Input
                  isRequired
                  fontSize='sm' placeholder='Min. 8 characters' mb='24px' size='lg'
                  type={show ? "text" : "password"} variant='auth'
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
                <InputRightElement display='flex' alignItems='center' mt='4px'>
                  <Icon
                    color={textColorSecondary} _hover={{ cursor: "pointer" }}
                    as={(show ? RiEyeCloseLine : MdOutlineRemoveRedEye) as any}
                    onClick={handleClick}
                  />
                </InputRightElement>
              </InputGroup>

              <Flex justifyContent='space-between' align='center' mb='24px'>
                <FormControl display='flex' alignItems='center'>
                  <Checkbox id='remember-login' colorScheme='brandScheme' me='10px' />
                  <FormLabel htmlFor='remember-login' mb='0' fontWeight='normal' color={textColor} fontSize='sm'>
                    Keep me logged in
                  </FormLabel>
                </FormControl>
                <NavLink to='/auth/forgot-password'>
                  <Text color={textColorBrand} fontSize='sm' w='124px' fontWeight='500'>
                    Forgot password?
                  </Text>
                </NavLink>
              </Flex>

              <Button
                type="submit"
                fontSize='sm' variant='brand' fontWeight='500' w='100%' h='50' mb='24px'
                isLoading={isLoading} loadingText="Signing in..."
              >
                Sign In
              </Button>
            </FormControl>
          </form>

          <Flex flexDirection='column' justifyContent='center' alignItems='start' maxW='100%' mt='0px'>
            <Text color={textColorDetails} fontWeight='400' fontSize='14px'>
              Not registered yet?
              <NavLink to='/auth/sign-up'>
                <Text color={textColorBrand} as='span' ms='5px' fontWeight='500'>
                  Create an Account
                </Text>
              </NavLink>
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignIn;
