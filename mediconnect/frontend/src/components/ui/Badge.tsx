import React from 'react';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'gray'
  | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  primary: 'bg-blue-100 text-blue-800 border-blue-200',
  secondary: 'bg-teal-100 text-teal-800 border-teal-200',
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  danger: 'bg-rose-100 text-rose-800 border-rose-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
  info: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

const Badge: React.FC<BadgeProps> = ({ variant = 'gray', size = 'sm', children, className = '' }) => {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantMap[variant]} ${sizeClass} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
