import {
  Box,
  Flex,
  Heading,
  Button,
  Spacer,
  Text,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { logout, user } = useAuth();

  return (
    <Box bg="white" shadow="sm" px={4} py={3}>
      <Flex align="center">
        <Heading size="md" color="blue.600">
          Londoolink AI
        </Heading>
        
        <Spacer />
        
        <Box>
          <Text fontSize="sm" color="gray.600" mr={4}>
            Welcome, {user?.email}
          </Text>
          <Button
            size="sm"
            variant="outline"
            colorScheme="red"
            onClick={logout}
          >
            Logout
          </Button>
        </Box>
      </Flex>
    </Box>
  );
};

export default Navbar;
