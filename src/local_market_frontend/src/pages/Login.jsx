import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  VStack,
  Heading,
  useToast,
  Text,
  Spinner,
} from '@chakra-ui/react';
import { useAuth } from '../StateManagement/useContext/useClient.jsx';
import { AuthClient } from '@dfinity/auth-client';

const Login = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const { backendActor, login, setUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const checkUserType = async () => {
    try {
      setIsCheckingUser(true);
      const authClient = await AuthClient.create();
      const identity = await authClient.getIdentity();
      const principal = identity.getPrincipal();
      
      const user = await backendActor.get_user(principal);
      if (user) {
        setUser(user);
        switch (user.user_type) {
          case { Admin: null }:
            navigate('/admin/dashboard');
            break;
          case { Seller: null }:
            navigate('/seller/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        navigate('/register');
      }
    } catch (error) {
      console.error('Error checking user type:', error);
      toast({
        title: 'Error',
        description: 'Failed to check user type',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsCheckingUser(false);
    }
  };

  const handleLogin = async () => {
    try {
      setIsAuthenticating(true);
      await login();
      await checkUserType();
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius={8} boxShadow="lg">
      <VStack spacing={4}>
        <Heading>Login</Heading>
        <Text>Welcome to LocalMart</Text>
        
        {isCheckingUser ? (
          <VStack spacing={4}>
            <Spinner size="xl" />
            <Text>Checking your account...</Text>
          </VStack>
        ) : (
          <Button 
            onClick={handleLogin} 
            colorScheme="blue" 
            width="100%"
            isLoading={isAuthenticating}
            loadingText="Logging in..."
          >
            Login with Internet Identity
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default Login; 