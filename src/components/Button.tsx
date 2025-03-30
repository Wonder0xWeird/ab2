"use client";

import React, { ButtonHTMLAttributes } from 'react';

// Constants for the gold color palette (from theme.ts)
const GOLD_COLOR = "#cc9c42";
const SHADOW_COLOR = "#141921";

// Web kit no tap properties from theme.ts
const webkitNoTap = {
  WebkitTapHighlightColor: "transparent",
  WebkitTouchCallout: "none",
  WebkitUserSelect: "none",
  KhtmlUserSelect: "none",
  MozUserSelect: "none",
  msUserSelect: "none",
  userSelect: "none",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'brand' | 'danger' | 'ghost';
  fullWidth?: boolean;
  className?: string;
}

/**
 * A custom button component that matches the ABSTRACTU design language.
 * Styled after the brand button variant in theme.ts from the portfolio project.
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'brand',
  fullWidth = false,
  className = '',
  ...props
}) => {
  // Combine all classes
  const buttonClass = `abstractu-button ${variant} ${fullWidth ? 'full-width' : ''} ${className}`;

  return (
    <>
      <button className={buttonClass} {...props}>
        {children}
      </button>

      <style jsx>{`
        .abstractu-button {
          font-weight: normal;
          margin: 0;
          padding: 0.5rem 1.5rem;
          border-radius: 9999px;
          border: 1px solid ${GOLD_COLOR};
          font-size: 18px;
          background-color: transparent;
          color: #e0e0e0;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 3px 10px 5px ${SHADOW_COLOR}40;
          outline: none;
        }

        .abstractu-button:focus {
          outline: none;
        }
        
        .abstractu-button.full-width {
          width: 100%;
        }
        
        .abstractu-button.brand {
          border: 1px solid ${GOLD_COLOR};
        }
        
        .abstractu-button.brand:hover {
          background-color: ${GOLD_COLOR}10 !important;
        }
        
        .abstractu-button.brand:active,
        .abstractu-button.brand:focus {
          background-color: ${GOLD_COLOR}25 !important;
          color: #eee !important;
        }
        
        .abstractu-button.danger {
          border: 1px solid #ff6b6b;
          color: #ff6b6b;
        }
        
        .abstractu-button.danger:hover {
          background-color: rgba(220, 53, 69, 0.1) !important;
        }
        
        .abstractu-button.danger:active,
        .abstractu-button.danger:focus {
          background-color: rgba(220, 53, 69, 0.2) !important;
        }
        
        .abstractu-button.ghost {
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: none;
        }
        
        .abstractu-button.ghost:hover {
          background-color: rgba(255, 255, 255, 0.05) !important;
        }
        
        .abstractu-button.ghost:active,
        .abstractu-button.ghost:focus {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
        
        .abstractu-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background-color: transparent !important;
        }
      `}</style>
    </>
  );
};

export default Button; 