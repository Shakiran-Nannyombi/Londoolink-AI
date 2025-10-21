import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Spinner,
  Box,
  Alert,
  AlertIcon,
  VStack,
  Badge,
  Divider,
  List,
  ListItem,
  ListIcon,
  Flex,
} from '@chakra-ui/react';
import { CheckIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons';
import apiClient from '../api/apiClient';

const BriefingCard = () => {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBriefing();
  }, []);

  const fetchBriefing = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/agent/briefing/daily');
      setBriefing(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch briefing');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <Box display="flex" justifyContent="center" alignItems="center" py={8}>
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.500" />
              <Text>Generating your daily briefing...</Text>
            </VStack>
          </Box>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        </CardBody>
      </Card>
    );
  }

  if (!briefing) {
    return (
      <Card>
        <CardBody>
          <Text>No briefing data available.</Text>
        </CardBody>
      </Card>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <WarningIcon color="red.500" />;
      case 'medium':
        return <InfoIcon color="orange.500" />;
      case 'low':
        return <CheckIcon color="green.500" />;
      default:
        return <InfoIcon color="gray.500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <Heading size="lg">Your Daily Briefing</Heading>
        <Text color="gray.600" fontSize="sm">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Summary */}
          {briefing.summary && (
            <Box>
              <Heading size="md" mb={3}>Summary</Heading>
              <Text>{briefing.summary}</Text>
            </Box>
          )}

          {/* Priority Items */}
          {briefing.priority_items && briefing.priority_items.length > 0 && (
            <Box>
              <Heading size="md" mb={3}>Priority Items</Heading>
              <List spacing={3}>
                {briefing.priority_items.map((item, index) => (
                  <ListItem key={index}>
                    <Box p={3} border="1px" borderColor="gray.200" borderRadius="md">
                      <Flex align="center" mb={2}>
                        {getPriorityIcon(item.priority)}
                        <Badge
                          colorScheme={getPriorityColor(item.priority)}
                          ml={2}
                          mr={2}
                        >
                          {item.priority}
                        </Badge>
                        <Text fontWeight="bold">{item.title}</Text>
                      </Flex>
                      <Text fontSize="sm" color="gray.600">
                        {item.description}
                      </Text>
                      {item.deadline && (
                        <Text fontSize="xs" color="red.500" mt={1}>
                          Due: {item.deadline}
                        </Text>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Calendar Events */}
          {briefing.calendar_events && briefing.calendar_events.length > 0 && (
            <Box>
              <Heading size="md" mb={3}>Today's Schedule</Heading>
              <List spacing={2}>
                {briefing.calendar_events.map((event, index) => (
                  <ListItem key={index}>
                    <Box p={2} bg="blue.50" borderRadius="md">
                      <Text fontWeight="bold">{event.title}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {event.time} - {event.duration}
                      </Text>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Messages */}
          {briefing.messages && briefing.messages.length > 0 && (
            <Box>
              <Heading size="md" mb={3}>Important Messages</Heading>
              <List spacing={2}>
                {briefing.messages.map((message, index) => (
                  <ListItem key={index}>
                    <Box p={2} bg="green.50" borderRadius="md">
                      <Text fontWeight="bold">{message.from}</Text>
                      <Text fontSize="sm">{message.subject}</Text>
                      <Text fontSize="xs" color="gray.500">
                        {message.time}
                      </Text>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Recommendations */}
          {briefing.recommendations && briefing.recommendations.length > 0 && (
            <Box>
              <Heading size="md" mb={3}>Recommendations</Heading>
              <List spacing={2}>
                {briefing.recommendations.map((rec, index) => (
                  <ListItem key={index}>
                    <Box p={2} bg="purple.50" borderRadius="md">
                      <Text>{rec}</Text>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default BriefingCard;
