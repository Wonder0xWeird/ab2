'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'brand';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  className?: string;
  isExternal?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  active?: boolean;
  icon?: string;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  href,
  className = '',
  isExternal = false,
  onClick,
  type = 'button',
  disabled = false,
  active = false,
  icon,
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500';

  const variantStyles = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm',
    secondary: 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm',
    outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800',
    ghost: 'text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800',
    brand: `btn-brand ${active ? 'btn-brand-active' : ''}`,
  };

  const sizeStyles = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base  py-2',
    lg: 'text-lg px-6 py-3',
  };

  // Only apply size styles if not using brand variant
  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${variant !== 'brand' ? sizeStyles[size] : ''} ${className}`;

  const content = (
    <>
      {icon && (
        <Image
          src={icon}
          alt=""
          width={24}
          height={24}
          className="mr-2"
        />
      )}
      {children}
    </>
  );

  if (href) {
    if (isExternal) {
      return (
        <a
          href={href}
          className={buttonStyles}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        href={href}
        className={buttonStyles}
        onClick={onClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={buttonStyles}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {content}
    </button>
  );
};

export default Button; 