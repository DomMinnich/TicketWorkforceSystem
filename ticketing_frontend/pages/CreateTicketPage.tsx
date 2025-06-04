
import React from 'react';
import TicketForm from '../components/tickets/TicketForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

const CreateTicketPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link to="/tickets">
            <Button variant="ghost" size="sm" icon={<ArrowLeftIcon className="h-5 w-5"/>}>
                Back to Tickets
            </Button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Create New Ticket</h1>
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl">
        <TicketForm />
      </div>
    </div>
  );
};

export default CreateTicketPage;
