import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      textAlign="center"
    >
      <Heading size="2xl" mb={4}>
        404
      </Heading>
      <Text fontSize="xl" mb={8} color="gray.600">
        Page not found
      </Text>
      <Button colorScheme="blue" onClick={() => navigate('/')}>
        Go Home
      </Button>
    </Box>
  );
};

export default NotFound;
