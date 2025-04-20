import React, { useState } from 'react';
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
  Select,
  useToast,
  Radio,
  RadioGroup,
  Stack,
  Divider,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { local_market_backend } from '../../../declarations/local_market_backend';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userType: 'Buyer',
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

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
      // Get the current user's principal ID
      const principal = window.ic?.agent?.getPrincipal()?.toString() || '2vxsx-fae';
      
      // Register the user
      const result = await local_market_backend.register_user(
        formData.name,
        formData.email,
        formData.userType
      );
      
      if (result.Ok) {
        toast({
          title: 'Registration Successful',
          description: 'Your account has been created successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Redirect based on user type
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
        description: 'Failed to register user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

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