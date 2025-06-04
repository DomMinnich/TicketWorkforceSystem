
import React, { useState } from 'react';
import * as userService from '../../services/userService';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useNotifications } from '../../hooks/useNotifications';
import { KeyIcon } from '@heroicons/react/24/outline';

const ChangePasswordForm: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addNotification } = useNotifications();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!oldPassword) newErrors.oldPassword = 'Old password is required.';
    if (newPassword.length < 6) newErrors.newPassword = 'New password must be at least 6 characters.';
    if (newPassword !== confirmNewPassword) newErrors.confirmNewPassword = 'New passwords do not match.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});
    try {
      await userService.updateSelfPassword(oldPassword, newPassword);
      addNotification('Password updated successfully!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update password.';
      setErrors({ api: errorMessage });
      addNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Old Password"
        id="oldPassword"
        type="password"
        required
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        error={errors.oldPassword}
        icon={<KeyIcon className="h-5 w-5 text-gray-400" />}
      />
      <Input
        label="New Password"
        id="newPassword"
        type="password"
        required
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        error={errors.newPassword}
        icon={<KeyIcon className="h-5 w-5 text-gray-400" />}
      />
      <Input
        label="Confirm New Password"
        id="confirmNewPassword"
        type="password"
        required
        value={confirmNewPassword}
        onChange={(e) => setConfirmNewPassword(e.target.value)}
        error={errors.confirmNewPassword}
        icon={<KeyIcon className="h-5 w-5 text-gray-400" />}
      />
      {errors.api && (
          <p className="text-xs text-red-600 dark:text-red-400">{errors.api}</p>
      )}
      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          Update Password
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
