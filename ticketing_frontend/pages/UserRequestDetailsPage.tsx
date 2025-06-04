
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserRequest } from '../types';
import * as requestService from '../services/requestService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import { formatDate, formatDateTime } from '../utils/helpers';
import { ArrowLeftIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';

const UserRequestDetailsPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [requestData, setRequestData] = useState<UserRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchRequestDetails = useCallback(async () => {
    if (!requestId) return;
    setLoading(true);
    setError(null);
    try {
      const fetchedRequest = await requestService.getUserRequestById(requestId);
      setRequestData(fetchedRequest);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch request details');
      addNotification(err.message || 'Failed to fetch request details', 'error');
      if (err.status === 403 || err.status === 404) navigate('/requests/users');
    } finally {
      setLoading(false);
    }
  }, [requestId, addNotification, navigate]);

  useEffect(() => {
    fetchRequestDetails();
  }, [fetchRequestDetails]);

  const handleClose = async () => {
    if (!requestId) return;
    setIsActionLoading(true);
    try {
      await requestService.closeUserRequest(requestId);
      addNotification('Request closed successfully!', 'success');
      fetchRequestDetails();
    } catch (err: any) {
      addNotification(err.message || 'Failed to close request', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
  if (error) return <p className="text-center text-red-500 dark:text-red-400">{error}</p>;
  if (!requestData) return <p className="text-center text-gray-500 dark:text-gray-400">Request not found.</p>;

  const isAdminIT = user?.role === 'admin' && (user.associations.includes('bravo') || user.associations.includes('oscar') || user.associations.includes('IT'));
  const isOpen = requestData.status === 'open';

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link to="/requests/users">
          <Button variant="ghost" size="sm" icon={<ArrowLeftIcon className="h-5 w-5" />}>
            Back to Employee Requests
          </Button>
        </Link>
      </div>
      
      <Card>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Employee Request: {requestData.fname} {requestData.lname}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-700 dark:text-gray-300 mb-6">
            <p><strong>ID:</strong> {requestData.id}</p>
            <p><strong>Requested by:</strong> {requestData.user_email || 'N/A'}</p>
            <p><strong>Submitted:</strong> {formatDateTime(requestData.timestamp)}</p>
            <p><strong>Job Title:</strong> {requestData.job_title}</p>
            <p><strong>Department:</strong> {requestData.department}</p>
            <p><strong>Start Date:</strong> {formatDate(requestData.start_date)}</p>
            <p><strong>Status:</strong> <span className={`font-semibold ${isOpen ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>{requestData.status}</span></p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Description / Needs</h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{requestData.description}</p>
        </div>

        {isAdminIT && isOpen && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={handleClose} isLoading={isActionLoading} variant="secondary" icon={<ArchiveBoxXMarkIcon className="h-5 w-5"/>}>Mark as Closed</Button>
        </div>
        )}
      </Card>
    </div>
  );
};

export default UserRequestDetailsPage;
