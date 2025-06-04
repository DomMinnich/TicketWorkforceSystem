
import React from 'react';
import { ShieldExclamationIcon } from '@heroicons/react/24/solid';
import { SUPER_ADMIN_EMAIL_PLACEHOLDER } from '../constants';

const LicenseExpiredPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 dark:bg-red-900 text-center px-4">
      <ShieldExclamationIcon className="h-24 w-24 text-red-500 dark:text-red-400 mb-6" />
      <h1 className="text-4xl font-bold text-red-700 dark:text-red-200 mb-4">Service Unavailable</h1>
      <h2 className="text-xl font-semibold text-red-600 dark:text-red-300 mb-3">License Expired</h2>
      <p className="text-red-700 dark:text-red-200 mb-2 max-w-lg">
        Access to the Saint Elizabeth Ticket System is currently unavailable because the software license has expired.
      </p>
      <p className="text-red-600 dark:text-red-300 mb-8 max-w-lg">
        Please contact the system administrator to renew the license and restore service.
        You can reach out to <strong className="font-semibold">{SUPER_ADMIN_EMAIL_PLACEHOLDER}</strong> for assistance.
      </p>
       {/* <Button variant="danger" onClick={() => window.location.reload()}>
        Retry Connection
      </Button> */}
    </div>
  );
};

export default LicenseExpiredPage;
