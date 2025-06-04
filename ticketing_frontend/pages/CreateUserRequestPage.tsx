
import React from 'react';
import UserRequestForm from '../components/requests/UserRequestForm';
import { Link }  from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const CreateUserRequestPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link to="/requests/users">
            <Button variant="ghost" size="sm" icon={<ArrowLeftIcon className="h-5 w-5"/>}>
                Back to Employee Requests
            </Button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">New Employee Request</h1>
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl">
        <UserRequestForm />
      </div>
    </div>
  );
};

export default CreateUserRequestPage;
