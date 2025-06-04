
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useNotifications } from '../../hooks/useNotifications';
import { KeyIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotifications();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      addNotification('Logged in successfully!', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      addNotification(errorMessage, 'error');
      setIsLoading(false);
    }
    // setIsLoading(false); // This line is moved to the catch block because successful login navigates away.
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Email address"
        id="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error && error.toLowerCase().includes('email') ? error : undefined}
        icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
      />
      <Input
        label="Password"
        id="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={error && (error.toLowerCase().includes('password') || error.toLowerCase().includes('credentials')) ? error : undefined}
        icon={<KeyIcon className="h-5 w-5 text-gray-400" />}
      />
      {error && !(error.toLowerCase().includes('email') || error.toLowerCase().includes('password') || error.toLowerCase().includes('credentials')) && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      <Button type="submit" isLoading={isLoading} className="w-full">
        Sign in
      </Button>
    </form>
  );
};

export default LoginForm;
