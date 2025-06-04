
import React from 'react';
import { Comment as CommentType } from '../../types';
import { formatDateTime, getInitials } from '../../utils/helpers';
import AttachmentLink from './AttachmentLink';
import { UserCircleIcon } from '@heroicons/react/24/outline';

interface CommentCardProps {
  comment: CommentType;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary-light dark:bg-primary-dark text-primary-dark dark:text-primary-light">
            <span className="font-medium leading-none">{getInitials(comment.user_email)}</span>
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {comment.user_email || 'Anonymous'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDateTime(comment.timestamp)}
          </p>
          <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {comment.text}
          </div>
          {comment.attachments && comment.attachments.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Attachments:</h4>
              <ul className="space-y-1">
                {comment.attachments.map(att => (
                  <AttachmentLink key={att.id} attachment={att} />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentCard;
