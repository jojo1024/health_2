import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-500',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 focus-visible:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
    text: 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus-visible:ring-gray-500',
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 py-3 text-base',
  };

  const widthClasses = fullWidth ? 'w-full' : '';
  const iconSpacing = icon || loading ? (iconPosition === 'left' ? 'gap-2' : 'flex-row-reverse gap-2') : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${iconSpacing} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full" />
      )}
      {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{loading ? 'Chargement...' : children}</span>
    </button>
  );
};

export default Button;
