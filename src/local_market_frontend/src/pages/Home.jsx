import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  useColorModeValue,
  Grid,
  GridItem,
  Image,
  Badge,
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Flex,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiMap, FiShoppingBag, FiUser, FiCheckCircle, FiSearch } from 'react-icons/fi';
import { local_market_backend } from '../../../declarations/local_market_backend';

const Feature = ({ icon: Icon, title, text }) => {
  return (
    <VStack spacing={4} align="start">
      <Box
        p={2}
        bg={useColorModeValue('blue.50', 'blue.900')}
        borderRadius="full"
      >
        <Icon size={24} />
      </Box>
      <Text fontWeight="bold" fontSize="lg">{title}</Text>
      <Text color="gray.600">{text}</Text>
    </VStack>
  );
};

const Home = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const shopsResult = await local_market_backend.get_shops_by_location(0, 0, 1000000);
      setShops(shopsResult);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || shop.products.some(p => p.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="80vh">
        <Spinner size="xl" />
      </Box>
    );
  }

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

      {/* Search Section */}
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search shops and products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Select
            placeholder="Filter by category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="groceries">Groceries</option>
            <option value="fresh_produce">Fresh Produce</option>
            <option value="dairy">Dairy</option>
            <option value="bakery">Bakery</option>
            <option value="meat">Meat</option>
            <option value="other">Other</option>
          </Select>
        </VStack>
      </Container>

      {/* Shops Section */}
      <Container maxW="container.xl" py={8}>
        <Heading size="lg" mb={6}>Featured Shops</Heading>
        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
          {filteredShops.map((shop) => (
            <GridItem key={shop.id}>
              <Box
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                p={4}
              >
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Heading size="md">{shop.name}</Heading>
                    <Text color="gray.600" mt={1}>{shop.description}</Text>
                    <HStack mt={2}>
                      <Badge colorScheme={shop.is_verified ? 'green' : 'yellow'}>
                        {shop.is_verified ? 'Verified' : 'Unverified'}
                      </Badge>
                      <Text fontSize="sm" color="gray.500">
                        {shop.location.address}
                      </Text>
                    </HStack>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>Products</Heading>
                    <SimpleGrid columns={2} spacing={2}>
                      {shop.products.slice(0, 4).map((product) => (
                        <Box
                          key={product.id}
                          p={2}
                          borderWidth="1px"
                          borderRadius="md"
                        >
                          <Text fontSize="sm" fontWeight="bold">{product.name}</Text>
                          <Text fontSize="sm" color="blue.500">
                            ${product.price.toFixed(2)}
                          </Text>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Box>
                  
                  <Button
                    as={RouterLink}
                    to={`/shop/${shop.id}`}
                    colorScheme="blue"
                    size="sm"
                  >
                    View Shop
                  </Button>
                </VStack>
              </Box>
            </GridItem>
          ))}
        </Grid>
      </Container>

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