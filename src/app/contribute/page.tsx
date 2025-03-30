"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ContributePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isContributeSubdomain, setIsContributeSubdomain] = useState(false);
  const [redirectInProgress, setRedirectInProgress] = useState(false);

  // Debug state and detection
  useEffect(() => {
    console.log("Contribute page - session status:", status);
    console.log("Contribute page - has session:", session !== null);
  }, [status, session]);

  // Check if we're on the contribute subdomain
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      console.log("Contribute page - hostname:", hostname);

      const subdomain = hostname === 'contribute.ab2.observer';
      setIsContributeSubdomain(subdomain);

      // For development, always handle as normal
      if (process.env.NODE_ENV === 'development') {
        console.log("Contribute page - dev mode, treating as main domain");
        setIsContributeSubdomain(false);
      }
    }
  }, []);

  // Handle authentication status
  useEffect(() => {
    // Don't redirect if we're already in the process of redirecting
    if (redirectInProgress) {
      return;
    }

    // Only redirect if we have a definitive status - either authenticated or unauthenticated
    if (status === "unauthenticated") {
      console.log("Contribute page - user is unauthenticated, need to redirect to signin");
      setRedirectInProgress(true);

      // If on contribute subdomain, redirect to sign-in with return flag
      if (isContributeSubdomain) {
        console.log("Contribute page - redirecting to main domain signin with returnToContribute");
        window.location.href = "https://ab2.observer/auth/signin?returnToContribute=true";
      } else {
        // Standard redirect to sign-in
        console.log("Contribute page - redirecting to signin on same domain");
        router.replace("/auth/signin");
      }
    } else if (status === "authenticated" && session) {
      console.log("Contribute page - user is authenticated, showing content");
      // User is authenticated, we can show the content
      setLoading(false);
    }
    // If status is still "loading", we maintain the loading state
  }, [status, router, isContributeSubdomain, session, redirectInProgress]);

  const handleSignOut = async () => {
    // If on contribute subdomain, sign out to main domain
    if (isContributeSubdomain) {
      await signOut({ callbackUrl: "https://ab2.observer" });
    } else {
      await signOut({ callbackUrl: "/" });
    }
  };

  // Show loading state longer to ensure we have a proper auth check
  if (loading || status === "loading") {
    return (
      <div className="contribute-loading">
        <div className="spinner"></div>
        <p>Loading contribution dashboard...</p>
      </div>
    );
  }

  return (
    <div className="contribute-container">
      {session?.user ? (
        <div className="contribute-card">
          <h1>Welcome to ABSTRACTU Contributions</h1>

          <div className="wallet-info">
            <h2>Connected Wallet</h2>
            <p className="address">{session.user.address}</p>
            <p className="auth-note">You are authenticated using Sign-In with Ethereum (SIWE)</p>
            <p className="auth-details">Your authentication includes enhanced security:</p>
            <ul className="security-features">
              <li>Time-sensitive signature with &quot;ABSTRACTU WELCOMES&quot; statement</li>
              <li>One-time use nonce for replay attack protection</li>
              <li>5-minute timestamp validation window</li>
              <li>MongoDB-backed verification system</li>
            </ul>
          </div>

          <div className="contribute-actions">
            <h2>Contribution Actions</h2>
            <div className="button-group">
              <Link
                href={isContributeSubdomain ? "https://contribute.ab2.observer/contribute/my-contributions" : "/contribute/my-contributions"}
                className="action-button"
              >
                View My Contributions
              </Link>
              <Link
                href={isContributeSubdomain ? "https://contribute.ab2.observer/contribute/new" : "/contribute/new"}
                className="action-button"
              >
                Create New Contribution
              </Link>
              <button onClick={handleSignOut} className="signout-button">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="error-card">
          <h2>Authentication Error</h2>
          <p>Your session appears to be invalid. Please sign in again.</p>
          <Link
            href={isContributeSubdomain ? "https://ab2.observer/auth/signin?returnToContribute=true" : "/auth/signin"}
            className="signin-link"
          >
            Sign In
          </Link>
        </div>
      )}

      <style jsx>{`
        .contribute-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
          padding: 2rem;
        }
        
        .contribute-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
        }
        
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 4px solid #FFD700;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .contribute-card {
          background-color: rgba(30, 30, 30, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          padding: 2rem;
          width: 90%;
          max-width: 800px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        h1 {
          margin-bottom: 2rem;
          font-size: 2rem;
          text-align: center;
          color: #FFD700;
        }
        
        h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #e0e0e0;
        }
        
        .wallet-info {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .address {
          background-color: rgba(0, 0, 0, 0.3);
          padding: 0.75rem;
          border-radius: 4px;
          font-family: monospace;
          word-break: break-all;
          margin-bottom: 1rem;
        }
        
        .auth-note {
          color: #ccc;
          margin-bottom: 1rem;
        }
        
        .auth-details {
          color: #aaa;
          margin-bottom: 0.5rem;
        }
        
        .security-features {
          color: #999;
          margin-left: 1.5rem;
          list-style-type: disc;
        }
        
        .security-features li {
          margin-bottom: 0.25rem;
        }
        
        .contribute-actions {
          text-align: center;
        }
        
        .button-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .action-button {
          background-color: #FFD700;
          color: #000;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          text-decoration: none;
        }
        
        .action-button:hover {
          background-color: #E6C200;
        }
        
        .signout-button {
          background-color: rgba(220, 53, 69, 0.2);
          color: #ff6b6b;
          border: 1px solid rgba(220, 53, 69, 0.4);
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 1rem;
        }
        
        .signout-button:hover {
          background-color: rgba(220, 53, 69, 0.3);
        }
        
        .error-card {
          background-color: rgba(30, 30, 30, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          padding: 2rem;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          text-align: center;
        }
        
        .signin-link {
          display: inline-block;
          background-color: #FFD700;
          color: #000;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          margin-top: 1rem;
        }
        
        .signin-link:hover {
          background-color: #E6C200;
        }
        
        @media (min-width: 768px) {
          .button-group {
            flex-direction: row;
            justify-content: center;
          }
          
          .signout-button {
            margin-top: 0;
          }
        }
      `}</style>
    </div>
  );
} 