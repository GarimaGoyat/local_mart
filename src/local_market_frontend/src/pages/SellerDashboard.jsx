import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  useDisclosure,
  Grid,
  GridItem,
  Image,
  Badge,
  Divider,
  Flex,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../StateManagement/useContext/useClient.jsx';

const SellerDashboard = () => {
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [newShop, setNewShop] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    address: '',
  });
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
  });
  const [selectedShop, setSelectedShop] = useState(null);
  const { isOpen: isShopModalOpen, onOpen: onShopModalOpen, onClose: onShopModalClose } = useDisclosure();
  const { isOpen: isProductModalOpen, onOpen: onProductModalOpen, onClose: onProductModalClose } = useDisclosure();
  const { backendActor, user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (user?.user_type?.Seller === undefined) {
      return;
    }
    loadShops();
  }, [user]);

  const loadShops = async () => {
    try {
      const authClient = await AuthClient.create();
      const identity = await authClient.getIdentity();
      const principal = identity.getPrincipal();
      const userShops = await backendActor.get_user_shops(principal);
      setShops(userShops);
    } catch (error) {
      console.error('Error loading shops:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shops',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleCreateShop = async (e) => {
    e.preventDefault();
    try {
      const location = {
        latitude: parseFloat(newShop.latitude),
        longitude: parseFloat(newShop.longitude),
        address: newShop.address,
        geohash: '', // You might want to generate this based on lat/long
      };

      await backendActor.create_shop(
        newShop.name,
        newShop.description,
        location
      );

      toast({
        title: 'Success',
        description: 'Shop created successfully',
        status: 'success',
        duration: 3000,
      });

      setNewShop({
        name: '',
        description: '',
        latitude: '',
        longitude: '',
        address: '',
      });

      onShopModalClose();
      loadShops();
    } catch (error) {
      console.error('Error creating shop:', error);
      toast({
        title: 'Error',
        description: 'Failed to create shop',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!selectedShop) return;

    try {
      await backendActor.add_product(
        selectedShop.id,
        newProduct.name,
        newProduct.description,
        parseFloat(newProduct.price),
        newProduct.category,
        parseInt(newProduct.stock)
      );

      toast({
        title: 'Success',
        description: 'Product added successfully',
        status: 'success',
        duration: 3000,
      });

      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
      });

      onProductModalClose();
      loadShops();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product',
        status: 'error',
        duration: 3000,
      });
    }
  };

  if (user?.user_type?.Seller === undefined) {
    return <Box p={4}>Access denied. Seller only.</Box>;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading>Seller Dashboard</Heading>

        <Tabs variant="enclosed">
          <TabList>
            <Tab>My Shops</Tab>
            <Tab>Products</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Box>
                <HStack justify="space-between" mb={4}>
                  <Heading size="md">My Shops</Heading>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    onClick={onShopModalOpen}
                  >
                    Add New Shop
                  </Button>
                </HStack>

                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Description</Th>
                      <Th>Location</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {shops.map((shop) => (
                      <Tr key={shop.id}>
                        <Td>{shop.name}</Td>
                        <Td>{shop.description}</Td>
                        <Td>{shop.location.address}</Td>
                        <Td>
                          <Badge
                            colorScheme={shop.is_verified ? 'green' : 'yellow'}
                          >
                            {shop.is_verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </Td>
                        <Td>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedShop(shop);
                              onProductModalOpen();
                            }}
                          >
                            Add Product
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            <TabPanel>
              <Box>
                <Heading size="md" mb={4}>Products</Heading>
                <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
                  {shops.map((shop) =>
                    shop.products.map((product) => (
                      <GridItem key={product.id}>
                        <Box
                          p={5}
                          shadow="md"
                          borderWidth="1px"
                          borderRadius="lg"
                        >
                          <VStack align="start" spacing={3}>
                            <Heading size="md">{product.name}</Heading>
                            <Text>{product.description}</Text>
                            <Text>Price: ${product.price}</Text>
                            <Text>Stock: {product.stock}</Text>
                            <Badge colorScheme="blue">{product.category}</Badge>
                            <Text fontSize="sm" color="gray.500">
                              Shop: {shop.name}
                            </Text>
                          </VStack>
                        </Box>
                      </GridItem>
                    ))
                  )}
                </Grid>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Add Shop Modal */}
        <Modal isOpen={isShopModalOpen} onClose={onShopModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New Shop</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <form onSubmit={handleCreateShop}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Shop Name</FormLabel>
                    <Input
                      value={newShop.name}
                      onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
                      placeholder="Enter shop name"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={newShop.description}
                      onChange={(e) => setNewShop({ ...newShop, description: e.target.value })}
                      placeholder="Enter shop description"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Latitude</FormLabel>
                    <Input
                      type="number"
                      value={newShop.latitude}
                      onChange={(e) => setNewShop({ ...newShop, latitude: e.target.value })}
                      placeholder="Enter latitude"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Longitude</FormLabel>
                    <Input
                      type="number"
                      value={newShop.longitude}
                      onChange={(e) => setNewShop({ ...newShop, longitude: e.target.value })}
                      placeholder="Enter longitude"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Address</FormLabel>
                    <Input
                      value={newShop.address}
                      onChange={(e) => setNewShop({ ...newShop, address: e.target.value })}
                      placeholder="Enter address"
                    />
                  </FormControl>
                  <Button type="submit" colorScheme="blue" width="100%">
                    Create Shop
                  </Button>
                </VStack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Add Product Modal */}
        <Modal isOpen={isProductModalOpen} onClose={onProductModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New Product to {selectedShop?.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <form onSubmit={handleAddProduct}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Product Name</FormLabel>
                    <Input
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Enter product name"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Enter product description"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Price</FormLabel>
                    <NumberInput
                      value={newProduct.price}
                      onChange={(value) => setNewProduct({ ...newProduct, price: value })}
                      min={0}
                    >
                      <NumberInputField placeholder="Enter price" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Category</FormLabel>
                    <Input
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      placeholder="Enter category"
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Stock</FormLabel>
                    <NumberInput
                      value={newProduct.stock}
                      onChange={(value) => setNewProduct({ ...newProduct, stock: value })}
                      min={0}
                    >
                      <NumberInputField placeholder="Enter stock" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <Button type="submit" colorScheme="blue" width="100%">
                    Add Product
                  </Button>
                </VStack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default SellerDashboard; 