import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Radio,
  RadioGroup,
  Stack,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { local_market_backend } from '../../../declarations/local_market_backend';
import { AuthClient } from '@dfinity/auth-client';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userType: 'Buyer',
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authClient = await AuthClient.create();
      const authenticated = await authClient.isAuthenticated();
      
      if (!authenticated) {
        // Redirect to Internet Identity
        await authClient.login({
          identityProvider: process.env.II_URL || "http://uxrrr-q7777-77774-qaaaq-cai.localhost:4943",
          onSuccess: () => {
            setIsAuthenticated(true);
            setLoading(false);
          },
        });
      } else {
        setIsAuthenticated(true);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      toast({
        title: 'Authentication Error',
        description: 'Failed to check authentication status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleUserTypeChange = (value) => {
    setFormData({
      ...formData,
      userType: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authClient = await AuthClient.create();
      const identity = await authClient.getIdentity();
      const principal = identity.getPrincipal();
      
      // Convert the user type string to the proper enum format
      const userType = {
        [formData.userType]: null
      };
      
      const result = await local_market_backend.register_user(
        formData.name,
        formData.email,
        userType
      );
      
      if ('Ok' in result) {
        toast({
          title: 'Registration Successful',
          description: 'Your account has been created successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        if (formData.userType === 'Seller') {
          navigate('/seller/dashboard');
        } else if (formData.userType === 'Admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        toast({
          title: 'Registration Failed',
          description: result.Err || 'Failed to register user',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error registering user:', error);
      toast({
        title: 'Error',
        description: 'Failed to register user. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.md" py={10}>
        <VStack spacing={8} align="center">
          <Spinner size="xl" />
          <Text>Checking authentication status...</Text>
        </VStack>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container maxW="container.md" py={10}>
        <VStack spacing={8} align="center">
          <Text>Redirecting to authentication...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="lg">Create Your Account</Heading>
          <Text color="gray.600" mt={2}>
            Join LocalMart and connect with local shops and sellers
          </Text>
        </Box>
        
        <Box as="form" onSubmit={handleSubmit} p={6} borderWidth="1px" borderRadius="lg">
          <VStack spacing={6}>
            <FormControl isRequired>
              <FormLabel>Full Name</FormLabel>
              <Input
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Account Type</FormLabel>
              <RadioGroup value={formData.userType} onChange={handleUserTypeChange}>
                <Stack direction="row" spacing={5}>
                  <Radio value="Buyer">Buyer</Radio>
                  <Radio value="Seller">Seller</Radio>
                  <Radio value="Admin">Admin</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            
            <Divider />
            
            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              isLoading={loading}
            >
              Register
            </Button>
          </VStack>
        </Box>
        
        <Box textAlign="center">
          <Text>
            Already have an account?{' '}
            <Button variant="link" colorScheme="blue" onClick={() => navigate('/login')}>
              Login here
            </Button>
          </Text>
        </Box>
      </VStack>
    </Container>
  );
};

export default Register; 