
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, title, className = '', titleClassName = '', bodyClassName = '', actions }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden ${className}`}>
      {title && (
        <div className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center ${titleClassName}`}>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className={`p-4 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};
