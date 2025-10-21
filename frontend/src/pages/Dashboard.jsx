import { Box, Container, VStack } from '@chakra-ui/react';
import Navbar from '../components/Navbar';
import BriefingCard from '../components/BriefingCard';

const Dashboard = () => {
  return (
    <Box minHeight="100vh" bg="gray.50">
      <Navbar />
      <Container maxW="4xl" py={8}>
        <VStack spacing={6} align="stretch">
          <BriefingCard />
        </VStack>
      </Container>
    </Box>
  );
};

export default Dashboard;
