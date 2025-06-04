
import React from 'react';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';
import { Card } from '../components/common/Card';
import { useAuth } from '../hooks/useAuth';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card title="User Information">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                    <UserCircleIcon className="h-10 w-10 text-primary dark:text-primary-light"/>
                    <div>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">{user.email}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                    </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Associations:</span> {user.associations || 'N/A'}
                </p>
                {/* Add more user details if available and relevant */}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Loading user data...</p>
            )}
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card title="Change Password">
            <ChangePasswordForm />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
