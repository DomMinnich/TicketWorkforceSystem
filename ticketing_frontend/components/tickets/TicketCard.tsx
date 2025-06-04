
import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket } from '../../types';
import { formatDate, getTicketStatusFriendly, truncateText, getInitials } from '../../utils/helpers';
import { Card } from '../common/Card';
import { ChatBubbleLeftEllipsisIcon, MapPinIcon, BuildingStorefrontIcon, UserCircleIcon, ClockIcon,ShieldExclamationIcon } from '@heroicons/react/24/outline';

interface TicketCardProps {
  ticket: Ticket;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const statusFriendly = getTicketStatusFriendly(ticket.status);
  const isOpen = ticket.status.toLowerCase() === 'open';

  return (
    <Link to={`/tickets/${ticket.id}`} className="block hover:shadow-2xl transition-shadow duration-200">
      <Card className={`h-full flex flex-col border-l-4 ${isOpen ? 'border-green-500' : 'border-red-500'} dark:border-opacity-70`}>
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white hover:text-primary dark:hover:text-primary-light transition-colors">
              {truncateText(ticket.title, 50)}
            </h2>
            {ticket.shimmer && <ShieldExclamationIcon className="h-5 w-5 text-yellow-500" titleAccess="Visible To Only ADMINS"/>}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID: {ticket.id}</p>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full mb-3 inline-block ${isOpen ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100'}`}>
            {statusFriendly}
          </span>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 h-12 overflow-hidden">
            {truncateText(ticket.description, 80)}
          </p>
          
          <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <UserCircleIcon className="h-4 w-4 mr-1.5" /> By: {ticket.user_email || 'N/A'}
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1.5" /> Created: {formatDate(ticket.timestamp)}
            </div>
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1.5" /> Location: {ticket.location}
            </div>
            <div className="flex items-center">
              <BuildingStorefrontIcon className="h-4 w-4 mr-1.5" /> Dept: {ticket.department}
            </div>
            {ticket.assignee_email && (
              <div className="flex items-center">
                <UserCircleIcon className="h-4 w-4 mr-1.5 text-indigo-500" /> Assigned: {ticket.assignee_email}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm">
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <ChatBubbleLeftEllipsisIcon className="h-5 w-5 mr-1" />
            <span>{ticket.total_comments || 0} Comments</span>
          </div>
          <span className="text-primary dark:text-primary-light font-medium hover:underline">View Details &rarr;</span>
        </div>
      </Card>
    </Link>
  );
};

export default TicketCard;
