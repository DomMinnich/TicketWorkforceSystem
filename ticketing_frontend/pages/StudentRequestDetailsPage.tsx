
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StudentRequest } from '../types';
import * as requestService from '../services/requestService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Checkbox } from '../components/common/Checkbox';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';
import { formatDateTime } from '../utils/helpers';
import { ArrowLeftIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';

type StudentStatusField = keyof Pick<StudentRequest, 'email_created' | 'computer_created' | 'bag_created' | 'id_card_created' | 'azure_created'>;

const StudentRequestDetailsPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [requestData, setRequestData] = useState<StudentRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<Record<string, boolean>>({});

  const fetchRequestDetails = useCallback(async () => {
    if (!requestId) return;
    setLoading(true);
    setError(null);
    try {
      const fetchedRequest = await requestService.getStudentRequestById(requestId);
      setRequestData(fetchedRequest);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch request details');
      addNotification(err.message || 'Failed to fetch request details', 'error');
      if (err.status === 403 || err.status === 404) navigate('/requests/students');
    } finally {
      setLoading(false);
    }
  }, [requestId, addNotification, navigate]);

  useEffect(() => {
    fetchRequestDetails();
  }, [fetchRequestDetails]);

  const handleToggleStatus = async (field: StudentStatusField) => {
    if (!requestId || !requestData) return;
    setIsActionLoading(prev => ({ ...prev, [field]: true }));
    try {
      await requestService.toggleStudentRequestStatusField(requestId, field);
      addNotification(`${field.replace('_', ' ')} status toggled successfully!`, 'success');
      fetchRequestDetails(); // Refresh data
    } catch (err: any) {
      addNotification(err.message || `Failed to toggle ${field} status`, 'error');
    } finally {
      setIsActionLoading(prev => ({ ...prev, [field]: false }));
    }
  };
  
  const handleCloseRequest = async () => {
    if (!requestId) return;
    setIsActionLoading(prev => ({ ...prev, closeRequest: true }));
    try {
      await requestService.closeStudentRequest(requestId);
      addNotification('Request closed successfully!', 'success');
      fetchRequestDetails();
    } catch (err:any) {
      addNotification(err.message || 'Failed to close request', 'error');
    } finally {
      setIsActionLoading(prev => ({ ...prev, closeRequest: false }));
    }
  };


  if (loading) return <div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
  if (error) return <p className="text-center text-red-500 dark:text-red-400">{error}</p>;
  if (!requestData) return <p className="text-center text-gray-500 dark:text-gray-400">Request not found.</p>;

  const isAdminIT = user?.role === 'admin' && (user.associations.includes('bravo') || user.associations.includes('oscar') || user.associations.includes('IT'));
  const isOpen = requestData.status === 'open';

  const statusFields: { field: StudentStatusField, label: string }[] = [
    { field: 'email_created', label: 'Email Account Created' },
    { field: 'computer_created', label: 'Computer Account Created' },
    { field: 'bag_created', label: 'Bag Assigned' },
    { field: 'id_card_created', label: 'ID Card Printed' },
    { field: 'azure_created', label: 'Azure Account Setup' },
  ];


  return (
    <div className="container mx-auto px-4 py-6">
       <div className="mb-6">
        <Link to="/requests/students">
          <Button variant="ghost" size="sm" icon={<ArrowLeftIcon className="h-5 w-5" />}>
            Back to Student Requests
          </Button>
        </Link>
      </div>
      <Card>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Student Request: {requestData.fname} {requestData.lname}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-700 dark:text-gray-300 mb-6">
            <p><strong>ID:</strong> {requestData.id}</p>
            <p><strong>Requested by:</strong> {requestData.user_email || 'N/A'}</p>
            <p><strong>Submitted:</strong> {formatDateTime(requestData.timestamp)}</p>
            <p><strong>Grade:</strong> {requestData.grade}</p>
            <p><strong>Teacher:</strong> {requestData.teacher}</p>
            <p><strong>Status:</strong> <span className={`font-semibold ${isOpen ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>{requestData.status}</span></p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Description / Needs</h3>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{requestData.description}</p>
        </div>

        {isAdminIT && isOpen && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Setup Checklist</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {statusFields.map(({ field, label }) => (
                <Checkbox
                    key={field}
                    id={field}
                    label={label}
                    checked={requestData[field]}
                    onChange={() => handleToggleStatus(field)}
                    disabled={isActionLoading[field]}
                />
                ))}
            </div>
            <div className="mt-6">
                <Button onClick={handleCloseRequest} isLoading={isActionLoading['closeRequest']} variant="secondary" icon={<ArchiveBoxXMarkIcon className="h-5 w-5"/>}>Mark Request as Closed</Button>
            </div>
            </div>
        )}
      </Card>
    </div>
  );
};

export default StudentRequestDetailsPage;
