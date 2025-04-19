import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Input,
  Select,
  Stack,
  Text,
  Badge,
  Image,
  useToast,
  Button,
  Flex,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { local_market_backend } from '../../../declarations/local_market_backend';

export default function ShopList() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [category, setCategory] = useState('all');
  const toast = useToast();

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          fetchNearbyShops(
            position.coords.latitude,
            position.coords.longitude,
            10
          );
        },
        (error) => {
          toast({
            title: 'Location Error',
            description: 'Unable to get your location. Please enable location services.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          setLoading(false);
        }
      );
    }
  }, []);

  const fetchNearbyShops = async (lat, lng, radius) => {
    try {
      const nearbyShops = await local_market_backend.get_shops_by_location(
        lat,
        lng,
        radius
      );
      setShops(nearbyShops);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch nearby shops.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  const filteredShops = shops.filter((shop) =>
    category === 'all' ? true : shop.category === category
  );

  return (
    <Container maxW="container.xl">
      <Stack spacing={8}>
        <Heading>Nearby Shops</Heading>

        <Flex gap={4}>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            w="200px"
          >
            <option value="all">All Categories</option>
            <option value="food">Food</option>
            <option value="grocery">Grocery</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="farm">Farm Fresh</option>
          </Select>
        </Flex>

        {location && (
          <Box h="400px" borderRadius="lg" overflow="hidden">
            <MapContainer
              center={[location.latitude, location.longitude]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredShops.map((shop) => (
                <Marker
                  key={shop.id}
                  position={[shop.location.latitude, shop.location.longitude]}
                >
                  <Popup>
                    <Text fontWeight="bold">{shop.name}</Text>
                    <Text>{shop.description}</Text>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Box>
        )}

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {loading ? (
            <Text>Loading shops...</Text>
          ) : (
            filteredShops.map((shop) => (
              <Box
                key={shop.id}
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                as={RouterLink}
                to={`/shop/${shop.id}`}
                _hover={{ transform: 'scale(1.02)', transition: '0.2s' }}
              >
                <Image
                  src={shop.image || 'https://via.placeholder.com/300x200'}
                  alt={shop.name}
                  height="200px"
                  width="100%"
                  objectFit="cover"
                />

                <Box p="6">
                  <Box display="flex" alignItems="baseline">
                    {shop.is_verified && (
                      <Badge borderRadius="full" px="2" colorScheme="teal">
                        Verified
                      </Badge>
                    )}
                    <Text
                      ml={2}
                      textTransform="uppercase"
                      fontSize="sm"
                      fontWeight="bold"
                      color="brand.600"
                    >
                      {shop.category}
                    </Text>
                  </Box>

                  <Box
                    mt="1"
                    fontWeight="semibold"
                    as="h4"
                    lineHeight="tight"
                    noOfLines={1}
                  >
                    {shop.name}
                  </Box>

                  <Text fontSize="sm" color="gray.600" noOfLines={2}>
                    {shop.description}
                  </Text>

                  <Text fontSize="sm" color="gray.500" mt={2}>
                    {shop.location.address}
                  </Text>
                </Box>
              </Box>
            ))
          )}
        </SimpleGrid>
      </Stack>
    </Container>
  );
} 