
import React, { useEffect, useState, useCallback } from 'react';
import { ManagedUser, UserRole } from '../types';
import * as userService from '../services/userService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { useNotifications } from '../hooks/useNotifications';
import { PencilSquareIcon, TrashIcon, KeyIcon } from '@heroicons/react/24/outline';
import { Card } from '../components/common/Card';
import { USER_ASSOCIATIONS_OPTIONS, USER_ROLES } from '../constants';
import { useAuth } from '../hooks/useAuth';


const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('user');
  const [editAssociations, setEditAssociations] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedUsers = await userService.getAllUsers();
      setUsers(fetchedUsers);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      addNotification(err.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openEditModal = (user: ManagedUser) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditAssociations(user.associations);
    setNewPassword('');
    setIsModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setIsUpdating(true);
    try {
      if (editRole !== selectedUser.role) {
        await userService.updateUserRole(selectedUser.email, editRole);
      }
      if (editAssociations !== selectedUser.associations) {
        await userService.updateUserAssociations(selectedUser.email, editAssociations);
      }
      if (newPassword) {
        await userService.updateUserPasswordByAdmin(selectedUser.email, newPassword);
      }
      addNotification(`User ${selectedUser.email} updated successfully!`, 'success');
      fetchUsers();
      setIsModalOpen(false);
    } catch (err: any) {
      addNotification(err.message || 'Failed to update user', 'error');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDeleteUser = async (email: string) => {
    if (email === currentUser?.email) {
        addNotification("You cannot delete yourself.", "error");
        return;
    }
    // Add check for super admin email if it's stored in constants and accessible
    // const { SUPER_ADMIN_EMAIL_PLACEHOLDER } = await import('../constants');
    // if (email === SUPER_ADMIN_EMAIL_PLACEHOLDER) {
    //   addNotification("Cannot delete the super admin account.", "error");
    //   return;
    // }

    if (window.confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
        try {
            await userService.deleteUser(email);
            addNotification(`User ${email} deleted successfully.`, 'success');
            fetchUsers();
        } catch (err:any) {
            addNotification(err.message || 'Failed to delete user.', 'error');
        }
    }
  };


  if (loading) return <div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
  if (error) return <p className="text-center text-red-500 dark:text-red-400">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">User Management</h1>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Associations</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.associations}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(user)} icon={<PencilSquareIcon className="h-4 w-4"/>} title="Edit User"/>
                    {/* Basic check to prevent deleting oneself or a potential super admin (super admin logic is primarily backend) */}
                    {(user.email !== currentUser?.email) && 
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.email)} icon={<TrashIcon className="h-4 w-4 text-red-500"/>} title="Delete User"/>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Edit User: ${selectedUser?.email}`}>
        {selectedUser && (
          <div className="space-y-4">
            <Select
              label="Role"
              options={USER_ROLES.map(role => ({ value: role, label: role.charAt(0).toUpperCase() + role.slice(1) }))}
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as UserRole)}
            />
             <Select
              label="Associations"
              options={USER_ASSOCIATIONS_OPTIONS}
              value={editAssociations}
              onChange={(e) => setEditAssociations(e.target.value)}
            />
            {/* A better UX for associations might be multi-select or checkboxes */}
            <Input
              label="New Associations (comma-separated)"
              id="associations-edit"
              value={editAssociations}
              onChange={(e) => setEditAssociations(e.target.value)}
              placeholder="e.g., IT,Maintenance,alpha"
            />
            <Input
              label="New Password (optional)"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              icon={<KeyIcon className="h-5 w-5 text-gray-400"/>}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateUser} isLoading={isUpdating}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagementPage;
