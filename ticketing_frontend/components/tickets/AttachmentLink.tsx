
import React from 'react';
import { TicketAttachment } from '../../types';
import { PaperClipIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../../constants'; 

interface AttachmentLinkProps {
  attachment: TicketAttachment;
}

const AttachmentLink: React.FC<AttachmentLinkProps> = ({ attachment }) => {
  const downloadUrl = `${API_BASE_URL}${attachment.url}`; // Backend serves at /api/attachments/<id>

  return (
    <li className="flex items-center justify-between py-2 px-3 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
      <div className="flex items-center flex-1 min-w-0">
        <PaperClipIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" aria-hidden="true" />
        <span className="truncate font-medium text-gray-700 dark:text-gray-200">{attachment.filename}</span>
      </div>
      <div className="ml-4 flex-shrink-0">
        <a
          href={downloadUrl}
          target="_blank" // Open in new tab or prompt download based on browser/Content-Disposition
          rel="noopener noreferrer"
          download // Suggests to browser to download
          className="font-medium text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary-darker flex items-center"
        >
          <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
          Download
        </a>
      </div>
    </li>
  );
};

export default AttachmentLink;
