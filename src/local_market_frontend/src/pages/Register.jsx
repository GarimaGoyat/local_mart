import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Select,
  useToast,
  Text,
  Spinner,
} from '@chakra-ui/react';
import { useAuth } from '../StateManagement/useContext/useClient.jsx';
import { AuthClient } from '@dfinity/auth-client';

const Register = () => {
  const [name, setName] = useState('');
  const [userType, setUserType] = useState('Admin');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const { backendActor, login, setUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authClient = await AuthClient.create();
      const isAuthed = await authClient.isAuthenticated();
      setIsAuthenticated(isAuthed);
      
      if (isAuthed) {
        const identity = await authClient.getIdentity();
        setPrincipal(identity.getPrincipal());
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleAuthenticate = async () => {
    try {
      setIsAuthenticating(true);
      await login();
      await checkAuthStatus();
      toast({
        title: 'Authentication successful',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: 'Authentication failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsAuthenticating(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please authenticate with Internet Identity first',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
  
    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your name',
        status: 'error',
        duration: 3000,
      });
      return;
    }
  
    try {
      console.log('Starting registration process...');
      console.log('Name:', name);
      console.log('User Type:', userType);
      console.log('Principal:', principal?.toString());
  
      // Convert string to enum object format
      const userTypeEnum = userType === 'Admin' ? { Admin: null } : { Seller: null };
      console.log('User Type Enum:', userTypeEnum);
  
      // Register the user
      const result = await backendActor.register_user(name.trim(), userTypeEnum);
      console.log('Registration result:', result);
  
      const [message, registeredUserType] = result;
      console.log('Message:', message);
      console.log('Registered User Type:', registeredUserType);
  
      // Show success message
      toast({
        title: 'Registration successful',
        description: message,
        status: 'success',
        duration: 3000,
      });
  
      // Update user state in context
      const authClient = await AuthClient.create();
      const identity = await authClient.getIdentity();
      const userPrincipal = identity.getPrincipal();
      const userData = await backendActor.get_user(userPrincipal);
      
      // Use the setUser function from context to update user state
      setUser(userData);
      
      // Force a hard navigation to the appropriate dashboard
      if (userType === 'Seller') {
        console.log('Redirecting to seller dashboard...');
        // Use window.location for a hard navigation
        window.location.href = '/seller/dashboard';
      } else if (userType === 'Admin') {
        console.log('Redirecting to admin dashboard...');
        window.location.href = '/admin/dashboard';
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: error.message || 'An error occurred during registration. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius={8} boxShadow="lg">
      <VStack spacing={4}>
        <Heading>Register</Heading>
        
        {!isAuthenticated ? (
          <VStack spacing={4} width="100%">
            <Text textAlign="center">
              You need to authenticate with Internet Identity before registering.
            </Text>
            <Button 
              onClick={handleAuthenticate} 
              colorScheme="blue" 
              width="100%"
              isLoading={isAuthenticating}
              loadingText="Authenticating..."
            >
              Authenticate with Internet Identity
            </Button>
          </VStack>
        ) : (
          <>
            <Box 
              p={4} 
              bg="green.50" 
              borderRadius="md" 
              width="100%" 
              textAlign="center"
            >
              <Text color="green.500" fontWeight="bold">
                ✓ Authenticated Successfully
              </Text>
              <Text fontSize="sm" color="gray.600" mt={1}>
                Principal ID: {principal?.toString()}
              </Text>
            </Box>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>User Type</FormLabel>
                  <Select value={userType} onChange={(e) => setUserType(e.target.value)}>
                    <option value="Admin">Admin</option>
                    <option value="Seller">Seller</option>
                  </Select>
                </FormControl>
                <Button type="submit" colorScheme="blue" width="100%">
                  Register
                </Button>
              </VStack>
            </form>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default Register; 