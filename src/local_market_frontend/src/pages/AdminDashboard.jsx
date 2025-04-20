import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Stack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Link,
  Spinner,
  HStack,
  VStack,
  Divider,
  useDisclosure,
} from '@chakra-ui/react';
import { FiCheck, FiX } from 'react-icons/fi';
import { local_market_backend } from '../../../declarations/local_market_backend';
import { useAuth } from '../StateManagement/useContext/useClient';

const AdminDashboard = () => {
  const [shops, setShops] = useState([]);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { backendActor, user } = useAuth();

  useEffect(() => {
    if (user?.user_type?.Admin === undefined) {
      return;
    }
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // Get all shops
      const shopsResult = await local_market_backend.get_shops_by_location(0, 0, 1000000);
      setShops(shopsResult);
      
      // Get verification requests
      const requests = shopsResult
        .filter(shop => !shop.is_verified)
        .map(shop => ({
          shop_id: shop.id,
          documents: [],
          status: { Pending: null },
          created_at: shop.created_at,
        }));
      
      setVerificationRequests(requests);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch admin data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (shopId, approved) => {
    try {
      await backendActor.process_verification(shopId, approved);
      toast({
        title: 'Success',
        description: `Shop verification ${approved ? 'approved' : 'rejected'}`,
        status: 'success',
        duration: 3000,
      });
      fetchAdminData();
    } catch (error) {
      console.error('Error processing verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to process verification request',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const openVerificationModal = (request) => {
    setSelectedRequest(request);
    onOpen();
  };

  if (user?.user_type?.Admin === undefined) {
    return <Box p={4}>Access denied. Admin only.</Box>;
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="80vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading size="lg" mb={6}>Admin Dashboard</Heading>
      
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Verification Requests</Tab>
          <Tab>All Shops</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <Box>
              <Heading size="md" mb={4}>Verification Requests</Heading>
              
              {verificationRequests.length === 0 ? (
                <Text color="gray.500">No pending verification requests.</Text>
              ) : (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Shop ID</Th>
                      <Th>Owner</Th>
                      <Th>Documents</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {verificationRequests.map((request) => (
                      <Tr key={request.shop_id}>
                        <Td>{request.shop_id}</Td>
                        <Td>{request.owner.toString()}</Td>
                        <Td>{request.documents.join(', ')}</Td>
                        <Td>{request.status}</Td>
                        <Td>
                          {request.status === 'Pending' && (
                            <>
                              <Button
                                size="sm"
                                colorScheme="green"
                                mr={2}
                                onClick={() => handleVerification(request.shop_id, true)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                onClick={() => handleVerification(request.shop_id, false)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>
          </TabPanel>
          
          <TabPanel>
            <Box>
              <Heading size="md" mb={4}>All Shops</Heading>
              
              {shops.length === 0 ? (
                <Text color="gray.500">No shops found.</Text>
              ) : (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Shop Name</Th>
                      <Th>Owner</Th>
                      <Th>Location</Th>
                      <Th>Status</Th>
                      <Th>Created At</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {shops.map((shop) => (
                      <Tr key={shop.id}>
                        <Td>{shop.name}</Td>
                        <Td>{shop.owner.toString().substring(0, 10)}...</Td>
                        <Td>{shop.location.address}</Td>
                        <Td>
                          <Badge colorScheme={shop.is_verified ? 'green' : 'yellow'}>
                            {shop.is_verified ? 'Verified' : 'Unverified'}
                          </Badge>
                        </Td>
                        <Td>{new Date(Number(shop.created_at) / 1000000).toLocaleDateString()}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Verification Request Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Review Verification Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedRequest && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold">Shop ID:</Text>
                  <Text>{selectedRequest.shop_id}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Created At:</Text>
                  <Text>{new Date(Number(selectedRequest.created_at) / 1000000).toLocaleString()}</Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Documents:</Text>
                  {selectedRequest.documents.length > 0 ? (
                    <Stack spacing={2} mt={2}>
                      {selectedRequest.documents.map((doc, index) => (
                        <Link key={index} href={doc} isExternal color="blue.500">
                          Document {index + 1}
                        </Link>
                      ))}
                    </Stack>
                  ) : (
                    <Text color="gray.500">No documents provided</Text>
                  )}
                </Box>
                
                <Divider />
                
                <HStack spacing={4} justify="center">
                  <Button
                    colorScheme="green"
                    leftIcon={<FiCheck />}
                    onClick={() => handleVerification(selectedRequest.shop_id, true)}
                  >
                    Approve
                  </Button>
                  <Button
                    colorScheme="red"
                    leftIcon={<FiX />}
                    onClick={() => handleVerification(selectedRequest.shop_id, false)}
                  >
                    Reject
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AdminDashboard; 