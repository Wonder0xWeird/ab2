"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, router]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {session?.user ? (
        <div className="dashboard-card">
          <h1>Welcome to ABSTRACTU</h1>

          <div className="wallet-info">
            <h2>Connected Wallet</h2>
            <p className="address">{session.user.address}</p>
            <p className="auth-note">You are authenticated using Sign-In with Ethereum (SIWE)</p>
            <p className="auth-details">Your authentication includes enhanced security:</p>
            <ul className="security-features">
              <li>Time-sensitive signature with "ABSTRACTU WELCOMES" statement</li>
              <li>One-time use nonce for replay attack protection</li>
              <li>5-minute timestamp validation window</li>
              <li>MongoDB-backed verification system</li>
            </ul>
          </div>

          <div className="dashboard-actions">
            <h2>Actions</h2>
            <div className="button-group">
              <Link href="/dashboard/contributions" className="action-button">
                View My Contributions
              </Link>
              <Link href="/dashboard/contribute" className="action-button">
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
          <Link href="/auth/signin" className="signin-link">
            Sign In
          </Link>
        </div>
      )}

      <style jsx>{`
        .dashboard-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
          padding: 2rem;
        }
        
        .dashboard-loading {
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
        
        .dashboard-card {
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
        
        .dashboard-actions {
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