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
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { local_market_backend } from '../../../declarations/local_market_backend';

const SellerDashboard = () => {
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    address: '',
    contact: '',
  });
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    images: [],
  });
  const [verificationFormData, setVerificationFormData] = useState({
    documents: [],
  });
  const { isOpen: isShopModalOpen, onOpen: onShopModalOpen, onClose: onShopModalClose } = useDisclosure();
  const { isOpen: isProductModalOpen, onOpen: onProductModalOpen, onClose: onProductModalClose } = useDisclosure();
  const { isOpen: isVerificationModalOpen, onOpen: onVerificationModalOpen, onClose: onVerificationModalClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchSellerData();
  }, []);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      const authClient = await AuthClient.create();
      const identity = await authClient.getIdentity();
      const principal = identity.getPrincipal();
      
      // Get the user data
      const userResult = await local_market_backend.get_user(principal);
      
      if (userResult && userResult.length > 0) {
        const user = userResult[0];
        
        // Get the shop data for this seller
        const shopsResult = await local_market_backend.get_shops_by_location(0, 0, 1000000);
        const sellerShop = shopsResult.find(s => s.owner === principal);
        
        if (sellerShop) {
          setShop(sellerShop);
          
          // Get the products for this shop
          const productsResult = await local_market_backend.get_shop_products(sellerShop.id);
          setProducts(productsResult);
        }
      }
    } catch (error) {
      console.error('Error fetching seller data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch seller data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShop = async () => {
    try {
      const location = {
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        address: formData.address,
        geohash: 'placeholder', // This would be generated on the backend
      };
      
      const result = await local_market_backend.create_shop(
        formData.name,
        formData.description,
        location,
        formData.contact
      );
      
      if (result.Ok) {
        setShop(result.Ok);
        onShopModalClose();
        toast({
          title: 'Shop Created',
          description: 'Your shop has been created successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: result.Err || 'Failed to create shop',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error creating shop:', error);
      toast({
        title: 'Error',
        description: 'Failed to create shop',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddProduct = async () => {
    try {
      const result = await local_market_backend.add_product(
        shop.id,
        productFormData.name,
        productFormData.description,
        parseFloat(productFormData.price),
        productFormData.category,
        productFormData.images
      );
      
      if (result.Ok) {
        setProducts([...products, result.Ok]);
        onProductModalClose();
        toast({
          title: 'Product Added',
          description: 'Product has been added successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: result.Err || 'Failed to add product',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRequestVerification = async () => {
    try {
      const result = await local_market_backend.request_verification(
        shop.id,
        verificationFormData.documents
      );
      
      if (result.Ok) {
        onVerificationModalClose();
        toast({
          title: 'Verification Requested',
          description: 'Your verification request has been submitted',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: result.Err || 'Failed to submit verification request',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error requesting verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit verification request',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="80vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      {!shop ? (
        <VStack spacing={6} align="center" py={10}>
          <Heading size="lg">Welcome to Your Seller Dashboard</Heading>
          <Text textAlign="center" maxW="600px">
            You haven't created a shop yet. Create your shop to start selling products to local customers.
          </Text>
          <Button colorScheme="blue" leftIcon={<FiPlus />} onClick={onShopModalOpen}>
            Create Shop
          </Button>
        </VStack>
      ) : (
        <VStack spacing={8} align="stretch">
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="lg">{shop.name}</Heading>
              <Text color="gray.600">{shop.description}</Text>
              <HStack mt={2}>
                <Badge colorScheme={shop.is_verified ? 'green' : 'yellow'}>
                  {shop.is_verified ? 'Verified' : 'Unverified'}
                </Badge>
                <Text fontSize="sm" color="gray.500">
                  {shop.location.address}
                </Text>
              </HStack>
            </Box>
            <HStack spacing={4}>
              {!shop.is_verified && (
                <Button
                  colorScheme="yellow"
                  leftIcon={<FiAlertCircle />}
                  onClick={onVerificationModalOpen}
                >
                  Request Verification
                </Button>
              )}
              <Button colorScheme="blue" leftIcon={<FiPlus />} onClick={onProductModalOpen}>
                Add Product
              </Button>
            </HStack>
          </Flex>
          
          <Divider />
          
          <Tabs variant="enclosed">
            <TabList>
              <Tab>Products</Tab>
              <Tab>Shop Details</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
                  {products.map((product) => (
                    <GridItem key={product.id}>
                      <Box
                        borderWidth="1px"
                        borderRadius="lg"
                        overflow="hidden"
                        p={4}
                      >
                        {product.images.length > 0 && (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            borderRadius="md"
                            mb={4}
                          />
                        )}
                        <Heading size="md" mb={2}>{product.name}</Heading>
                        <Text color="gray.600" mb={2}>{product.description}</Text>
                        <Text fontWeight="bold" color="blue.500">
                          ${product.price.toFixed(2)}
                        </Text>
                        <Badge colorScheme={product.available ? 'green' : 'red'} mt={2}>
                          {product.available ? 'Available' : 'Out of Stock'}
                        </Badge>
                      </Box>
                    </GridItem>
                  ))}
                </Grid>
              </TabPanel>
              
              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <Box>
                    <Text fontWeight="bold">Contact Information</Text>
                    <Text>{shop.contact}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Location</Text>
                    <Text>{shop.location.address}</Text>
                    <Text fontSize="sm" color="gray.500">
                      Coordinates: {shop.location.latitude}, {shop.location.longitude}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Verification Status</Text>
                    <Badge colorScheme={shop.is_verified ? 'green' : 'yellow'}>
                      {shop.is_verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </Box>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      )}
      
      {/* Create Shop Modal */}
      <Modal isOpen={isShopModalOpen} onClose={onShopModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Your Shop</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Shop Name</FormLabel>
                <Input
                  placeholder="Enter your shop name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="Describe your shop"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Address</FormLabel>
                <Input
                  placeholder="Enter your shop address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </FormControl>
              
              <HStack width="100%">
                <FormControl isRequired>
                  <FormLabel>Latitude</FormLabel>
                  <NumberInput
                    value={formData.latitude}
                    onChange={(value) => setFormData({ ...formData, latitude: value })}
                    min={-90}
                    max={90}
                    precision={6}
                  >
                    <NumberInputField placeholder="Latitude" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Longitude</FormLabel>
                  <NumberInput
                    value={formData.longitude}
                    onChange={(value) => setFormData({ ...formData, longitude: value })}
                    min={-180}
                    max={180}
                    precision={6}
                  >
                    <NumberInputField placeholder="Longitude" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>
              
              <FormControl isRequired>
                <FormLabel>Contact Information</FormLabel>
                <Input
                  placeholder="Phone number or email"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                />
              </FormControl>
              
              <Button colorScheme="blue" width="100%" onClick={handleCreateShop}>
                Create Shop
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      
      {/* Add Product Modal */}
      <Modal isOpen={isProductModalOpen} onClose={onProductModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Product</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Product Name</FormLabel>
                <Input
                  placeholder="Enter product name"
                  value={productFormData.name}
                  onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="Describe your product"
                  value={productFormData.description}
                  onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Price</FormLabel>
                <NumberInput
                  value={productFormData.price}
                  onChange={(value) => setProductFormData({ ...productFormData, price: value })}
                  min={0}
                  precision={2}
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
                  placeholder="Select category"
                  value={productFormData.category}
                  onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                >
                  <option value="groceries">Groceries</option>
                  <option value="fresh_produce">Fresh Produce</option>
                  <option value="dairy">Dairy</option>
                  <option value="bakery">Bakery</option>
                  <option value="meat">Meat</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>
              
              <Button colorScheme="blue" width="100%" onClick={handleAddProduct}>
                Add Product
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      
      {/* Verification Request Modal */}
      <Modal isOpen={isVerificationModalOpen} onClose={onVerificationModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Request Shop Verification</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Text>
                To verify your shop, please provide the following documents:
              </Text>
              <FormControl>
                <FormLabel>Business Registration Number</FormLabel>
                <Input
                  placeholder="Enter your business registration number"
                  value={verificationFormData.documents[0] || ''}
                  onChange={(e) => setVerificationFormData({
                    ...verificationFormData,
                    documents: [e.target.value, ...verificationFormData.documents.slice(1)]
                  })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Tax ID</FormLabel>
                <Input
                  placeholder="Enter your tax ID"
                  value={verificationFormData.documents[1] || ''}
                  onChange={(e) => setVerificationFormData({
                    ...verificationFormData,
                    documents: [verificationFormData.documents[0], e.target.value, ...verificationFormData.documents.slice(2)]
                  })}
                />
              </FormControl>
              <Button colorScheme="blue" width="100%" onClick={handleRequestVerification}>
                Submit Verification Request
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default SellerDashboard; 