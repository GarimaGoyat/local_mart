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
  IconButton,
  Tooltip,
  Center,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiCheckCircle, FiAlertCircle, FiPackage, FiInfo, FiShoppingBag, FiHome } from 'react-icons/fi';
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
  const { isOpen: isShopDetailsModalOpen, onOpen: onShopDetailsModalOpen, onClose: onShopDetailsModalClose } = useDisclosure();
  const { backendActor, user } = useAuth();
  const toast = useToast();

  const categories = [
    'Electronics',
    'Clothing',
    'Food',
    'Books',
    'Home & Kitchen',
    'Sports',
    'Beauty',
    'Toys',
    'Automotive',
    'Health',
  ];

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
    if (!selectedShop) {
      toast({
        title: 'Error',
        description: 'Please select a shop first',
        status: 'error',
        duration: 3000,
      });
      return;
    }

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

  const handleUpdateShop = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implement shop update functionality
      toast({
        title: 'Success',
        description: 'Shop details updated successfully',
        status: 'success',
        duration: 3000,
      });
      onShopDetailsModalClose();
      loadShops();
    } catch (error) {
      console.error('Error updating shop:', error);
      toast({
        title: 'Error',
        description: 'Failed to update shop details',
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

        {/* Main Action Icons */}
        <Box 
          p={6} 
          bg="white" 
          borderRadius="lg" 
          boxShadow="md"
          mb={6}
        >
          <Center>
            <HStack spacing={12} justify="center" py={4}>
              <VStack spacing={3}>
                <Tooltip label="Add Products" placement="top">
                  <IconButton
                    icon={<FiShoppingBag size="32px" />}
                    size="xl"
                    colorScheme="blue"
                    onClick={() => {
                      if (shops.length === 0) {
                        toast({
                          title: 'No Shops',
                          description: 'Please create a shop first',
                          status: 'warning',
                          duration: 3000,
                        });
                        return;
                      }
                      onProductModalOpen();
                    }}
                    aria-label="Add Products"
                    width="100px"
                    height="100px"
                    borderRadius="full"
                    boxShadow="lg"
                    _hover={{
                      transform: 'scale(1.05)',
                      transition: 'all 0.2s ease-in-out',
                    }}
                  />
                </Tooltip>
                <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                  Add Products
                </Text>
              </VStack>
              <VStack spacing={3}>
                <Tooltip label="Shop Details" placement="top">
                  <IconButton
                    icon={<FiHome size="32px" />}
                    size="xl"
                    colorScheme="green"
                    onClick={() => {
                      if (shops.length === 0) {
                        toast({
                          title: 'No Shops',
                          description: 'Please create a shop first',
                          status: 'warning',
                          duration: 3000,
                        });
                        return;
                      }
                      setSelectedShop(shops[0]);
                      onShopDetailsModalOpen();
                    }}
                    aria-label="Shop Details"
                    width="100px"
                    height="100px"
                    borderRadius="full"
                    boxShadow="lg"
                    _hover={{
                      transform: 'scale(1.05)',
                      transition: 'all 0.2s ease-in-out',
                    }}
                  />
                </Tooltip>
                <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                  Shop Details
                </Text>
              </VStack>
            </HStack>
          </Center>
        </Box>

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
                          <HStack spacing={2}>
                            <Tooltip label="Add Product">
                              <IconButton
                                icon={<FiPackage />}
                                size="sm"
                                colorScheme="blue"
                                onClick={() => {
                                  setSelectedShop(shop);
                                  onProductModalOpen();
                                }}
                              />
                            </Tooltip>
                            <Tooltip label="Shop Details">
                              <IconButton
                                icon={<FiInfo />}
                                size="sm"
                                colorScheme="green"
                                onClick={() => {
                                  // TODO: Implement shop details view
                                  toast({
                                    title: 'Shop Details',
                                    description: `Viewing details for ${shop.name}`,
                                    status: 'info',
                                    duration: 3000,
                                  });
                                }}
                              />
                            </Tooltip>
                          </HStack>
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
                    <Select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      placeholder="Select category"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Quantity</FormLabel>
                    <NumberInput
                      value={newProduct.stock}
                      onChange={(value) => setNewProduct({ ...newProduct, stock: value })}
                      min={0}
                    >
                      <NumberInputField placeholder="Enter quantity" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <HStack spacing={4} width="100%" justify="flex-end">
                    <Button variant="outline" onClick={onProductModalClose}>
                      Cancel
                    </Button>
                    <Button type="submit" colorScheme="blue">
                      Save
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Shop Details Modal */}
        <Modal isOpen={isShopDetailsModalOpen} onClose={onShopDetailsModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Shop Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedShop && (
                <form onSubmit={handleUpdateShop}>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Shop Name</FormLabel>
                      <Input
                        value={selectedShop.name}
                        isReadOnly
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        value={selectedShop.description}
                        isReadOnly
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Address</FormLabel>
                      <Input
                        value={selectedShop.location.address}
                        isReadOnly
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Verification Status</FormLabel>
                      <Badge
                        colorScheme={selectedShop.is_verified ? 'green' : 'yellow'}
                        fontSize="md"
                        p={2}
                        borderRadius="md"
                      >
                        {selectedShop.is_verified ? 'Verified' : 'Pending Verification'}
                      </Badge>
                    </FormControl>
                    <HStack spacing={4} width="100%" justify="flex-end">
                      <Button variant="outline" onClick={onShopDetailsModalClose}>
                        Close
                      </Button>
                    </HStack>
                  </VStack>
                </form>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default SellerDashboard; 