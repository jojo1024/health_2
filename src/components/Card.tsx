import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  footer?: ReactNode;
  header?: ReactNode;
  noPadding?: boolean; // Permet d'enlever le padding pour les tables, etc.
}

const Card = ({
  children,
  title,
  className = '',
  footer,
  header,
  noPadding = false
}: CardProps) => {
  return (
    <div className={`bg-white rounded-lg shadow border border-gray-200 overflow-hidden ${className}`}>
      {header && (
        <div className="px-3 sm:px-5 py-2 sm:py-4 border-b border-gray-200">
          {header}
        </div>
      )}

      {title && (
        <div className="px-3 sm:px-5 py-2 sm:py-4 border-b border-gray-200">
          <h3 className="text-sm sm:text-lg font-medium text-gray-900">{title}</h3>
        </div>
      )}

      <div className={noPadding ? '' : 'p-3 sm:p-5'}>
        {children}
      </div>

      {footer && (
        <div className="px-3 sm:px-5 py-2 sm:py-4 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
