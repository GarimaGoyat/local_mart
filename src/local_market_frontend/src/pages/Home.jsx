import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
} from '@chakra-ui/react';
import { useColorModeValue } from '@chakra-ui/color-mode';
import { FiMap, FiShoppingBag, FiUser, FiCheckCircle } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';

const Feature = ({ title, text, icon }) => {
  return (
    <VStack
      align="start"
      p={6}
      bg={useColorModeValue('white', 'gray.700')}
      rounded="xl"
      shadow="md"
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-5px)', shadow: 'lg' }}
    >
      <Icon as={icon} w={10} h={10} color="blue.500" />
      <Heading size="md" mt={4}>
        {title}
      </Heading>
      <Text color={useColorModeValue('gray.600', 'gray.300')} mt={2}>
        {text}
      </Text>
    </VStack>
  );
};

const Home = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        bg={useColorModeValue('blue.50', 'blue.900')}
        py={20}
        px={4}
      >
        <Container maxW="container.xl">
          <VStack spacing={8} align="center" textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              bgGradient="linear(to-r, blue.400, teal.500)"
              bgClip="text"
            >
              LocalMart
            </Heading>
            <Text fontSize="xl" maxW="2xl">
              Connect with local shops, farmers, and sellers in your area. Buy fresh, local products and support your community.
            </Text>
            <HStack spacing={4}>
              <Button
                as={RouterLink}
                to="/browse"
                colorScheme="blue"
                size="lg"
              >
                Browse Shops
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                variant="outline"
                colorScheme="blue"
                size="lg"
              >
                Join as Seller
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="container.xl" py={16}>
        <VStack spacing={12}>
          <Heading textAlign="center">Why Choose LocalMart?</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10} width="100%">
            <Feature
              icon={FiMap}
              title="Local Discovery"
              text="Find shops and products near you with our location-based search."
            />
            <Feature
              icon={FiShoppingBag}
              title="Fresh Products"
              text="Get access to fresh, locally sourced products directly from producers."
            />
            <Feature
              icon={FiUser}
              title="Support Local"
              text="Support your local economy and build stronger communities."
            />
            <Feature
              icon={FiCheckCircle}
              title="Verified Sellers"
              text="All our sellers are verified to ensure quality and reliability."
            />
          </SimpleGrid>
        </VStack>
      </Container>

      {/* CTA Section */}
      <Box bg={useColorModeValue('gray.50', 'gray.800')} py={16}>
        <Container maxW="container.xl">
          <VStack spacing={6} align="center" textAlign="center">
            <Heading>Ready to start selling?</Heading>
            <Text fontSize="lg" maxW="2xl">
              Join LocalMart as a seller and reach customers in your area. Our platform makes it easy to manage your shop and products.
            </Text>
            <Button
              as={RouterLink}
              to="/register"
              colorScheme="blue"
              size="lg"
            >
              Register Now
            </Button>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 