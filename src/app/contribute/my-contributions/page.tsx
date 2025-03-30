"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MyContributionsPage() {
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your contributions...</p>
      </div>
    );
  }

  return (
    <div className="contributions-container">
      {session?.user ? (
        <div className="contributions-card">
          <h1>My Contributions</h1>
          <p className="info-text">This section will display all your contributions.</p>

          {/* Placeholder for future contributions list */}
          <div className="contributions-list">
            <div className="empty-state">
              <p>No contributions yet.</p>
              <p>Start by creating your first contribution!</p>
            </div>
          </div>

          <div className="actions">
            <Link href="/contribute" className="back-button">
              Back to Contributions
            </Link>
            <Link href="/contribute/new" className="create-button">
              Create New Contribution
            </Link>
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
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 80vh;
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
        
        .contributions-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
          padding: 2rem;
        }
        
        .contributions-card {
          background-color: rgba(30, 30, 30, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          padding: 2rem;
          width: 90%;
          max-width: 800px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        h1 {
          margin-bottom: 1rem;
          font-size: 2rem;
          text-align: center;
          color: #FFD700;
        }
        
        .info-text {
          text-align: center;
          margin-bottom: 2rem;
          color: #ccc;
        }
        
        .contributions-list {
          margin-bottom: 2rem;
          padding: 1rem;
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .empty-state {
          text-align: center;
          color: #888;
        }
        
        .empty-state p {
          margin: 0.5rem 0;
        }
        
        .actions {
          display: flex;
          justify-content: space-between;
          margin-top: 1rem;
        }
        
        .back-button, .create-button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        
        .back-button {
          background-color: rgba(0, 0, 0, 0.3);
          color: #ccc;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .back-button:hover {
          background-color: rgba(0, 0, 0, 0.4);
        }
        
        .create-button {
          background-color: #FFD700;
          color: #000;
        }
        
        .create-button:hover {
          background-color: #E6C200;
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
        
        @media (max-width: 768px) {
          .actions {
            flex-direction: column;
            gap: 1rem;
          }
          
          .back-button, .create-button {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
} 