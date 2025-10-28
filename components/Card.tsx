
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-navy-900 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-6 ${className}`}>
      {children}
    </div>
  );
};
