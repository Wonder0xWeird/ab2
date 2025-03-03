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
  variant = 'brand',
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
  const buttonStyles = `btn-brand ${active ? 'btn-brand-active' : ''} ${className}`;

  const content = (
    <>
      {icon && (
        <Image
          src={icon}
          alt=""
          width={24}
          height={24}
          style={{ marginRight: '0.5rem' }}
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