import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Image,
  Badge,
  Stack,
  Flex,
  Icon,
  useToast,
  Button,
} from '@chakra-ui/react';
import { FiMapPin, FiPhone, FiCheck } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { local_market_backend } from '../../../declarations/local_market_backend';

export default function ShopDetails() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchShopDetails();
  }, [id]);

  const fetchShopDetails = async () => {
    try {
      const [shopData, productsData] = await Promise.all([
        local_market_backend.get_shop(id),
        local_market_backend.get_shop_products(id),
      ]);

      if (shopData) {
        setShop(shopData);
        setProducts(productsData);
      } else {
        toast({
          title: 'Error',
          description: 'Shop not found',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch shop details',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!shop) {
    return <Text>Shop not found</Text>;
  }

  return (
    <Container maxW="container.xl">
      <Stack spacing={8}>
        <Box>
          <Flex align="center" mb={4}>
            <Heading>{shop.name}</Heading>
            {shop.is_verified && (
              <Badge ml={4} colorScheme="teal" fontSize="md">
                <Flex align="center">
                  <Icon as={FiCheck} mr={1} />
                  Verified
                </Flex>
              </Badge>
            )}
          </Flex>

          <Text color="gray.600" fontSize="lg" mb={6}>
            {shop.description}
          </Text>

          <Stack direction={{ base: 'column', md: 'row' }} spacing={6} mb={8}>
            <Flex align="center">
              <Icon as={FiMapPin} mr={2} color="brand.500" />
              <Text>{shop.location.address}</Text>
            </Flex>
            <Flex align="center">
              <Icon as={FiPhone} mr={2} color="brand.500" />
              <Text>{shop.contact}</Text>
            </Flex>
          </Stack>
        </Box>

        <Box h="300px" borderRadius="lg" overflow="hidden" mb={8}>
          <MapContainer
            center={[shop.location.latitude, shop.location.longitude]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[shop.location.latitude, shop.location.longitude]}>
              <Popup>
                <Text fontWeight="bold">{shop.name}</Text>
                <Text>{shop.description}</Text>
              </Popup>
            </Marker>
          </MapContainer>
        </Box>

        <Box>
          <Heading size="lg" mb={6}>
            Products
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {products.map((product) => (
              <Box
                key={product.id}
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
              >
                <Image
                  src={product.images[0] || 'https://via.placeholder.com/300x200'}
                  alt={product.name}
                  height="200px"
                  width="100%"
                  objectFit="cover"
                />

                <Box p="6">
                  <Box display="flex" alignItems="baseline">
                    <Badge borderRadius="full" px="2" colorScheme="brand">
                      {product.category}
                    </Badge>
                    {!product.available && (
                      <Badge
                        borderRadius="full"
                        px="2"
                        ml={2}
                        colorScheme="red"
                      >
                        Out of Stock
                      </Badge>
                    )}
                  </Box>

                  <Box
                    mt="1"
                    fontWeight="semibold"
                    as="h4"
                    lineHeight="tight"
                    noOfLines={1}
                  >
                    {product.name}
                  </Box>

                  <Text fontSize="sm" color="gray.600" noOfLines={2}>
                    {product.description}
                  </Text>

                  <Text
                    mt={2}
                    fontSize="2xl"
                    fontWeight="bold"
                    color="brand.600"
                  >
                    ₹{product.price}
                  </Text>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Stack>
    </Container>
  );
} 