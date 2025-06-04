
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { EquipmentRequest } from '../types';
import * as requestService from '../services/requestService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import { formatDate, formatDateTime } from '../utils/helpers';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';

const EquipmentRequestDetailsPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [request, setRequest] = useState<EquipmentRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchRequestDetails = useCallback(async () => {
    if (!requestId) return;
    setLoading(true);
    setError(null);
    try {
      const fetchedRequest = await requestService.getEquipmentRequestById(requestId);
      setRequest(fetchedRequest);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch request details');
      addNotification(err.message || 'Failed to fetch request details', 'error');
      if (err.status === 403 || err.status === 404) navigate('/requests/equipment');
    } finally {
      setLoading(false);
    }
  }, [requestId, addNotification, navigate]);

  useEffect(() => {
    fetchRequestDetails();
  }, [fetchRequestDetails]);

  const handleApprove = async () => {
    if (!requestId) return;
    setIsActionLoading(true);
    try {
      await requestService.approveEquipmentRequest(requestId);
      addNotification('Request approved successfully!', 'success');
      fetchRequestDetails();
    } catch (err: any) {
      addNotification(err.message || 'Failed to approve request', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeny = async () => {
    if (!requestId) return;
    setIsActionLoading(true);
    try {
      await requestService.denyEquipmentRequest(requestId);
      addNotification('Request denied successfully!', 'success');
      fetchRequestDetails();
    } catch (err: any) {
      addNotification(err.message || 'Failed to deny request', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleClose = async () => {
    if (!requestId) return;
    setIsActionLoading(true);
    try {
      await requestService.closeEquipmentRequest(requestId);
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
  if (!request) return <p className="text-center text-gray-500 dark:text-gray-400">Request not found.</p>;

  const isAdminIT = user?.role === 'admin' && (user.associations.includes('bravo') || user.associations.includes('oscar') || user.associations.includes('IT'));
  const isOpen = request.status === 'open';
  const isPending = request.approval_status === 'pending';

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link to="/requests/equipment">
          <Button variant="ghost" size="sm" icon={<ArrowLeftIcon className="h-5 w-5" />}>
            Back to Equipment Requests
          </Button>
        </Link>
      </div>
      
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                Equipment Request: {request.name} for {request.event}
            </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-700 dark:text-gray-300 mb-6">
            <p><strong>ID:</strong> {request.id}</p>
            <p><strong>Requested by:</strong> {request.user_email || 'N/A'}</p>
            <p><strong>Submitted:</strong> {formatDateTime(request.timestamp)}</p>
            <p><strong>Event Date & Time:</strong> {formatDate(request.date)} at {request.time}</p>
            <p><strong>Location:</strong> {request.location}</p>
            <p><strong>Equipment Needed:</strong> {request.equipment}</p>
            <p><strong>Return Date & Time:</strong> {formatDate(request.return_date)} at {request.return_time}</p>
            <p><strong>Status:</strong> <span className={`font-semibold ${isOpen ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>{request.status}</span></p>
            <p><strong>Approval:</strong> <span className={`font-semibold ${request.approval_status === 'approved' ? 'text-green-600 dark:text-green-400' : isPending ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>{request.approval_status}</span></p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Description</h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{request.description}</p>
        </div>

        {isAdminIT && isOpen && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
            {isPending && (
            <>
                <Button onClick={handleApprove} isLoading={isActionLoading} variant="primary" icon={<CheckCircleIcon className="h-5 w-5"/>}>Approve</Button>
                <Button onClick={handleDeny} isLoading={isActionLoading} variant="danger" icon={<XCircleIcon className="h-5 w-5"/>}>Deny</Button>
            </>
            )}
            <Button onClick={handleClose} isLoading={isActionLoading} variant="secondary" icon={<ArchiveBoxXMarkIcon className="h-5 w-5"/>}>Mark as Closed</Button>
        </div>
        )}
      </Card>
    </div>
  );
};

export default EquipmentRequestDetailsPage;
