"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import Button from "./Button";

// Constants for the gold color palette (from theme.ts)
const GOLD_COLOR = "#cc9c42";

/**
 * AuthHeader component that shows the user's authentication status
 * and provides login/logout functionality in the top right corner
 * of all pages in the application
 */
export default function AuthHeader() {
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('');

  // Get current path on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname + window.location.search);
    }
  }, []);

  // Fetch ENS name when address changes
  useEffect(() => {
    async function fetchENSName() {
      if (session?.user?.address) {
        try {
          // Using public ENS resolver API
          const response = await fetch(`https://api.ensideas.com/ens/resolve/${session.user.address}`);
          const data = await response.json();

          if (data.name) {
            setEnsName(data.name);
          } else {
            setEnsName(null);
          }
        } catch (error) {
          console.error("Error fetching ENS name:", error);
          setEnsName(null);
        }
      } else {
        setEnsName(null);
      }
    }

    fetchENSName();
  }, [session?.user?.address]);

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

      // For main domain or local development, include the callbackUrl to return to current page
      const callbackUrl = encodeURIComponent(currentPath || '/');
      return `/auth/signin?callbackUrl=${callbackUrl}`;
    }

    // Fallback for SSR context
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
      // On main domain, redirect to current page
      await signOut({ callbackUrl: currentPath || '/' });
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

  // Determine the display text (ENS name or formatted address)
  const displayName = ensName || (session?.user?.address ? formatAddress(session.user.address) : '');

  return (
    <div className={`auth-header ${isExpanded ? 'expanded' : ''}`}>
      <div className="card-header" onClick={toggleExpand}>
        {session?.user ? (
          <div className="user-info">
            <div className="status-dot connected" />
            <span className="wallet-preview">{displayName}</span>
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
                {ensName && (
                  <p className="ens-name">{ensName}</p>
                )}
                <p className="wallet-address">{session.user.address}</p>
              </div>
              <div className="button-container">
                <Button variant="danger" onClick={handleSignOut} fullWidth>
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div className="button-container">
              <Link href={getLoginUrl()} className="link-no-style">
                <Button variant="brand" fullWidth>
                  Sign In
                </Button>
              </Link>
            </div>
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
        
        .ens-name {
          font-size: 0.85rem;
          color: ${GOLD_COLOR};
          margin-bottom: 0.25rem;
          font-weight: bold;
        }
        
        .wallet-address {
          font-family: monospace;
          font-size: 0.8rem;
          background-color: rgba(0, 0, 0, 0.3);
          padding: 0.5rem;
          border-radius: 4px;
          word-break: break-all;
          color: #e0e0e0;
          margin-bottom: 1rem;
        }
        
        .button-container {
          width: 100%;
        }
        
        .link-no-style {
          text-decoration: none;
          width: 100%;
          display: block;
        }
      `}</style>
    </div>
  );
}