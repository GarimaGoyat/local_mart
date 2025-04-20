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
} from '@chakra-ui/react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
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
  const { isOpen: isShopModalOpen, onOpen: onShopModalOpen, onClose: onShopModalClose } = useDisclosure();
  const { isOpen: isProductModalOpen, onOpen: onProductModalOpen, onClose: onProductModalClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchSellerData();
  }, []);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      // Get the current user's principal ID
      const principal = window.ic?.agent?.getPrincipal()?.toString() || '2vxsx-fae';
      
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
      if (!shop) return;
      
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
          description: 'Your product has been added successfully',
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

  const handleDeleteProduct = async (productId) => {
    try {
      // This would be implemented in the backend
      // For now, we'll just update the UI
      setProducts(products.filter(p => p.id !== productId));
      toast({
        title: 'Product Deleted',
        description: 'Your product has been deleted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
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
            <Button colorScheme="blue" leftIcon={<FiPlus />} onClick={onProductModalOpen}>
              Add Product
            </Button>
          </Flex>
          
          <Divider />
          
          <Box>
            <Heading size="md" mb={4}>Your Products</Heading>
            {products.length === 0 ? (
              <Text color="gray.500">You haven't added any products yet.</Text>
            ) : (
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
                {products.map((product) => (
                  <GridItem key={product.id} borderWidth="1px" borderRadius="lg" overflow="hidden">
                    <Box p={4}>
                      <Flex justify="space-between" align="start">
                        <Box>
                          <Heading size="sm">{product.name}</Heading>
                          <Text color="gray.600" fontSize="sm" mt={1}>
                            {product.description}
                          </Text>
                          <Text fontWeight="bold" mt={2}>
                            ${product.price.toFixed(2)}
                          </Text>
                          <Badge colorScheme={product.available ? 'green' : 'red'} mt={2}>
                            {product.available ? 'Available' : 'Out of Stock'}
                          </Badge>
                        </Box>
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <FiTrash2 />
                        </Button>
                      </Flex>
                    </Box>
                  </GridItem>
                ))}
              </Grid>
            )}
          </Box>
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
                  <option value="fruits">Fruits</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="dairy">Dairy</option>
                  <option value="meat">Meat</option>
                  <option value="bakery">Bakery</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Image URLs (one per line)</FormLabel>
                <Textarea
                  placeholder="Enter image URLs, one per line"
                  value={productFormData.images.join('\n')}
                  onChange={(e) => setProductFormData({
                    ...productFormData,
                    images: e.target.value.split('\n').filter(url => url.trim() !== '')
                  })}
                />
              </FormControl>
              
              <Button colorScheme="blue" width="100%" onClick={handleAddProduct}>
                Add Product
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default SellerDashboard; 