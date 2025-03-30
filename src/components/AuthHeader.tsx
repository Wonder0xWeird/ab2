"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

/**
 * AuthHeader component that shows the user's authentication status
 * and provides login/logout functionality in the top right corner
 * of all pages in the application
 */
export default function AuthHeader() {
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine the login URL - always use the main domain
  const getLoginUrl = () => {
    // Check if we're on the contribute subdomain
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isContributeSubdomain = hostname === 'contribute.ab2.observer';

      // If we're on the contribute subdomain, add returnToContribute parameter
      if (isContributeSubdomain) {
        return "https://ab2.observer/auth/signin?returnToContribute=true";
      }
    }

    // If we're on the main domain, just use relative path
    if (typeof window !== 'undefined' && window.location.hostname === 'ab2.observer') {
      return "/auth/signin";
    }

    // For local development or other cases
    return "/auth/signin";
  };

  // Handle sign out
  const handleSignOut = async () => {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const isContributeSubdomain = hostname === 'contribute.ab2.observer';

    if (isContributeSubdomain) {
      // On contribute subdomain, redirect to main domain
      await signOut({ callbackUrl: "https://ab2.observer" });
    } else {
      // On main domain, redirect to home
      await signOut({ callbackUrl: "/" });
    }
  };

  // Toggle card expansion
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className={`auth-header ${isExpanded ? 'expanded' : ''}`}>
      <div className="card-header" onClick={toggleExpand}>
        {session?.user ? (
          <div className="user-info">
            <div className="status-dot connected" />
            <span className="wallet-preview">{formatAddress(session.user.address || '')}</span>
          </div>
        ) : (
          <div className="user-info">
            <div className="status-dot disconnected" />
            <span className="login-text">Not connected</span>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="card-content">
          {session?.user ? (
            <>
              <div className="wallet-details">
                <p className="wallet-label">Connected Wallet:</p>
                <p className="wallet-address">{session.user.address}</p>
              </div>
              <button onClick={handleSignOut} className="signout-button">
                Sign Out
              </button>
            </>
          ) : (
            <Link href={getLoginUrl()} className="signin-button">
              Sign In
            </Link>
          )}
        </div>
      )}

      <style jsx>{`
        .auth-header {
          position: fixed;
          top: 1rem;
          right: 1rem;
          background-color: rgba(30, 30, 30, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          overflow: hidden;
          transition: all 0.3s ease;
          width: auto;
          min-width: 160px;
        }
        
        .auth-header.expanded {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
        
        .card-header {
          padding: 0.75rem 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background-color 0.2s ease;
        }
        
        .card-header:hover {
          background-color: rgba(40, 40, 40, 0.8);
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .status-dot.connected {
          background-color: #4CAF50;
          box-shadow: 0 0 5px #4CAF50;
        }
        
        .status-dot.disconnected {
          background-color: #ccc;
        }
        
        .wallet-preview {
          font-family: monospace;
          font-size: 0.875rem;
          color: #e0e0e0;
        }
        
        .login-text {
          font-size: 0.875rem;
          color: #ccc;
        }
        
        .card-content {
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .wallet-details {
          margin-bottom: 1rem;
        }
        
        .wallet-label {
          font-size: 0.75rem;
          color: #aaa;
          margin-bottom: 0.25rem;
        }
        
        .wallet-address {
          font-family: monospace;
          font-size: 0.8rem;
          background-color: rgba(0, 0, 0, 0.3);
          padding: 0.5rem;
          border-radius: 4px;
          word-break: break-all;
          color: #e0e0e0;
        }
        
        .signout-button {
          background-color: rgba(220, 53, 69, 0.2);
          color: #ff6b6b;
          border: 1px solid rgba(220, 53, 69, 0.4);
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          font-weight: bold;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }
        
        .signout-button:hover {
          background-color: rgba(220, 53, 69, 0.3);
        }
        
        .signin-button {
          display: block;
          background-color: #FFD700;
          color: #000;
          border: none;
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          font-weight: bold;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          text-decoration: none;
        }
        
        .signin-button:hover {
          background-color: #E6C200;
        }
      `}</style>
    </div>
  );
} 