"use client";

import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'brand' | 'danger' | 'ghost';
  fullWidth?: boolean;
  className?: string;
}

/**
 * A custom button component that matches the ABSTRACTU design language.
 * Uses global CSS classes defined in globals.css
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'brand',
  fullWidth = false,
  className = '',
  ...props
}) => {
  // Combine all classes
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    fullWidth ? 'btn-full-width' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
};

export default Button; 