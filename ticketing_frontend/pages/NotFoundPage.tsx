
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-center px-4">
      <ExclamationTriangleIcon className="h-20 w-20 text-yellow-400 mb-6" />
      <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Page Not Found</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        Oops! The page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <Link to="/dashboard">
        <Button variant="primary">
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
