
import React, { useEffect } from 'react';
import { XCircleIcon, CheckCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Notification, NotificationType } from '../../types';

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const icons: Record<NotificationType, React.ElementType> = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
  warning: ExclamationTriangleIcon,
};

const bgColors: Record<NotificationType, string> = {
  success: 'bg-green-50 dark:bg-green-900 border-green-400 dark:border-green-600',
  error: 'bg-red-50 dark:bg-red-900 border-red-400 dark:border-red-600',
  info: 'bg-blue-50 dark:bg-blue-900 border-blue-400 dark:border-blue-600',
  warning: 'bg-yellow-50 dark:bg-yellow-900 border-yellow-400 dark:border-yellow-600',
};

const textColors: Record<NotificationType, string> = {
  success: 'text-green-700 dark:text-green-200',
  error: 'text-red-700 dark:text-red-200',
  info: 'text-blue-700 dark:text-blue-200',
  warning: 'text-yellow-700 dark:text-yellow-200',
};

const iconColors: Record<NotificationType, string> = {
  success: 'text-green-500 dark:text-green-400',
  error: 'text-red-500 dark:text-red-400',
  info: 'text-blue-500 dark:text-blue-400',
  warning: 'text-yellow-500 dark:text-yellow-400',
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDismiss }) => {
  const Icon = icons[notification.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000); // Auto-dismiss after 5 seconds
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  return (
    <div className={`p-4 rounded-md shadow-lg border ${bgColors[notification.type]} ${textColors[notification.type]}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconColors[notification.type]}`} aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={() => onDismiss(notification.id)}
              className={`inline-flex rounded-md p-1.5 ${textColors[notification.type]} hover:bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                notification.type === 'success' ? 'hover:bg-green-100 dark:hover:bg-green-800 focus:ring-offset-green-50 dark:focus:ring-offset-green-900 focus:ring-green-600 dark:focus:ring-green-500' :
                notification.type === 'error'   ? 'hover:bg-red-100 dark:hover:bg-red-800 focus:ring-offset-red-50 dark:focus:ring-offset-red-900 focus:ring-red-600 dark:focus:ring-red-500' :
                notification.type === 'info'    ? 'hover:bg-blue-100 dark:hover:bg-blue-800 focus:ring-offset-blue-50 dark:focus:ring-offset-blue-900 focus:ring-blue-600 dark:focus:ring-blue-500' :
                                                  'hover:bg-yellow-100 dark:hover:bg-yellow-800 focus:ring-offset-yellow-50 dark:focus:ring-offset-yellow-900 focus:ring-yellow-600 dark:focus:ring-yellow-500'
              }`}
            >
              <span className="sr-only">Dismiss</span>
              <XCircleIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
