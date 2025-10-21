import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  Switch,
  FormControl as FormControlSwitch,
  FormLabel as FormLabelSwitch,
  Container,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = isLogin 
      ? await login(email, password)
      : await register(email, password);

    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Container maxW="md" py={8}>
      <Card>
        <CardBody>
          <VStack spacing={6}>
            <Heading size="lg" textAlign="center">
              Londoolink AI
            </Heading>
            
            <Text textAlign="center" color="gray.600">
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </Text>

            <FormControl as="form" onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    minLength={6}
                  />
                </FormControl>

                {error && (
                  <Alert status="error">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="full"
                  isLoading={loading}
                  loadingText={isLogin ? 'Signing in...' : 'Creating account...'}
                >
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Button>

                <FormControlSwitch display="flex" alignItems="center">
                  <FormLabelSwitch htmlFor="mode-switch" mb="0">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                  </FormLabelSwitch>
                  <Switch
                    id="mode-switch"
                    isChecked={!isLogin}
                    onChange={() => {
                      setIsLogin(!isLogin);
                      setError('');
                    }}
                  />
                </FormControlSwitch>
              </VStack>
            </FormControl>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};

export default Login;
