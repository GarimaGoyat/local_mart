import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ChakraProvider, Box, Container, Flex, Button, Heading, Spacer, Text } from '@chakra-ui/react';
import { FiHome, FiUser, FiShoppingBag, FiSettings } from 'react-icons/fi';
import theme from './theme';

// Import pages
import Home from './pages/Home';
import Register from './pages/Register';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box minH="100vh" display="flex" flexDirection="column">
          {/* Header */}
          <Box as="header" bg="blue.500" color="white" py={4}>
            <Container maxW="container.xl">
              <Flex align="center">
                <Link to="/">
                  <Heading size="md">LocalMart</Heading>
                </Link>
                <Spacer />
                <Flex gap={4}>
                  <Button 
                    as={Link} 
                    to="/" 
                    variant="ghost" 
                    colorScheme="whiteAlpha" 
                    leftIcon={<FiHome size="20px" color="#1a365d" />}
                    _hover={{ bg: 'whiteAlpha.300' }}
                    color="white"
                    fontWeight="bold"
                  >
                    Home
                  </Button>
                  <Button 
                    as={Link} 
                    to="/register" 
                    variant="ghost" 
                    colorScheme="whiteAlpha" 
                    leftIcon={<FiUser size="20px" color="#1a365d" />}
                    _hover={{ bg: 'whiteAlpha.300' }}
                    color="white"
                    fontWeight="bold"
                  >
                    Register
                  </Button>
                  <Button 
                    as={Link} 
                    to="/seller/dashboard" 
                    variant="ghost" 
                    colorScheme="whiteAlpha" 
                    leftIcon={<FiShoppingBag size="20px" color="#1a365d" />}
                    _hover={{ bg: 'whiteAlpha.300' }}
                    color="white"
                    fontWeight="bold"
                  >
                    Seller Dashboard
                  </Button>
                  <Button 
                    as={Link} 
                    to="/admin/dashboard" 
                    variant="ghost" 
                    colorScheme="whiteAlpha" 
                    leftIcon={<FiSettings size="20px" color="#1a365d" />}
                    _hover={{ bg: 'whiteAlpha.300' }}
                    color="white"
                    fontWeight="bold"
                  >
                    Admin Dashboard
                  </Button>
                </Flex>
              </Flex>
            </Container>
          </Box>

          {/* Main Content */}
          <Box as="main" flex="1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/seller/dashboard" element={<SellerDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
          </Box>

          {/* Footer */}
          <Box as="footer" bg="gray.100" py={6}>
            <Container maxW="container.xl">
              <Flex justify="center">
                <Text color="gray.600">© 2023 LocalMart. All rights reserved.</Text>
              </Flex>
            </Container>
          </Box>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;

