
import React from 'react';
import StudentRequestForm from '../components/requests/StudentRequestForm';
import { Link }  from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const CreateStudentRequestPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link to="/requests/students">
            <Button variant="ghost" size="sm" icon={<ArrowLeftIcon className="h-5 w-5"/>}>
                Back to Student Requests
            </Button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">New Student Request</h1>
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl">
        <StudentRequestForm />
      </div>
    </div>
  );
};

export default CreateStudentRequestPage;
