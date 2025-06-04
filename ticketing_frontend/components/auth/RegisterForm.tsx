
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useNotifications } from '../../hooks/useNotifications';
import { KeyIcon, EnvelopeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email.includes('@')) newErrors.email = 'Invalid email address.';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    if (!authCode.trim()) newErrors.authCode = 'Authentication code is required.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    setErrors({});
    try {
      await register(email, password, authCode);
      addNotification('Registration successful! Please log in.', 'success');
      navigate('/login');
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setErrors({ api: errorMessage });
      addNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
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
        error={errors.email}
        icon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
      />
      <Input
        label="Password"
        id="password"
        type="password"
        autoComplete="new-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        icon={<KeyIcon className="h-5 w-5 text-gray-400" />}
      />
      <Input
        label="Confirm Password"
        id="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        icon={<KeyIcon className="h-5 w-5 text-gray-400" />}
      />
      <Input
        label="Authentication Code"
        id="authCode"
        type="text"
        required
        value={authCode}
        onChange={(e) => setAuthCode(e.target.value)}
        error={errors.authCode}
        icon={<ShieldCheckIcon className="h-5 w-5 text-gray-400" />}
      />
      {errors.api && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.api}</p>
      )}
      <Button type="submit" isLoading={isLoading} className="w-full">
        Create account
      </Button>
    </form>
  );
};

export default RegisterForm;
