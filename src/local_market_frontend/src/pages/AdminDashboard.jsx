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
} from '@chakra-ui/react';
import { FiCheck, FiX } from 'react-icons/fi';
import { local_market_backend } from '../../../declarations/local_market_backend';

export default function AdminDashboard() {
  const [shops, setShops] = useState([]);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [shopsData, requestsData] = await Promise.all([
        local_market_backend.get_all_shops(),
        local_market_backend.get_verification_requests(),
      ]);
      setShops(shopsData);
      setVerificationRequests(requestsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch admin data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  const handleVerification = async (shopId, status) => {
    try {
      await local_market_backend.process_verification(shopId, status);
      await fetchAdminData();
      toast({
        title: 'Success',
        description: `Shop ${
          status === 'Approved' ? 'verified' : 'verification rejected'
        } successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process verification',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const openVerificationModal = (request) => {
    setSelectedRequest(request);
    onOpen();
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <Container maxW="container.xl">
      <Stack spacing={8}>
        <Heading>Admin Dashboard</Heading>

        <Tabs>
          <TabList>
            <Tab>Verification Requests</Tab>
            <Tab>All Shops</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Shop Name</Th>
                    <Th>Submitted On</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {verificationRequests.map((request) => (
                    <Tr key={request.shop_id}>
                      <Td>
                        {shops.find((s) => s.id === request.shop_id)?.name}
                      </Td>
                      <Td>
                        {new Date(
                          Number(request.created_at) / 1_000_000
                        ).toLocaleDateString()}
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            request.status === 'Pending'
                              ? 'yellow'
                              : request.status === 'Approved'
                              ? 'green'
                              : 'red'
                          }
                        >
                          {request.status}
                        </Badge>
                      </Td>
                      <Td>
                        {request.status === 'Pending' && (
                          <Button
                            size="sm"
                            onClick={() => openVerificationModal(request)}
                          >
                            Review
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TabPanel>

            <TabPanel>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Shop Name</Th>
                    <Th>Owner</Th>
                    <Th>Location</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {shops.map((shop) => (
                    <Tr key={shop.id}>
                      <Td>{shop.name}</Td>
                      <Td>{shop.owner.toText()}</Td>
                      <Td>{shop.location.address}</Td>
                      <Td>
                        <Badge
                          colorScheme={shop.is_verified ? 'green' : 'yellow'}
                        >
                          {shop.is_verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </Td>
                      <Td>
                        <Link href={`/shop/${shop.id}`} color="brand.500">
                          View Details
                        </Link>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>

      {/* Verification Review Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Review Verification Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedRequest && (
              <Stack spacing={4}>
                <Box>
                  <Text fontWeight="bold">Shop Name:</Text>
                  <Text>
                    {shops.find((s) => s.id === selectedRequest.shop_id)?.name}
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Submitted Documents:</Text>
                  {selectedRequest.documents.map((doc, index) => (
                    <Link
                      key={index}
                      href={doc}
                      color="brand.500"
                      display="block"
                      isExternal
                    >
                      Document {index + 1}
                    </Link>
                  ))}
                </Box>
                <Stack direction="row" spacing={4} mt={4}>
                  <Button
                    leftIcon={<FiCheck />}
                    colorScheme="green"
                    onClick={() =>
                      handleVerification(
                        selectedRequest.shop_id,
                        'Approved'
                      )
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    leftIcon={<FiX />}
                    colorScheme="red"
                    onClick={() =>
                      handleVerification(
                        selectedRequest.shop_id,
                        'Rejected'
                      )
                    }
                  >
                    Reject
                  </Button>
                </Stack>
              </Stack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
} 