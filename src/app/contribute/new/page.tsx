"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function NewContributionPage() {
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
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="new-contribution-container">
      {session?.user ? (
        <div className="new-contribution-card">
          <h1>Create New Contribution</h1>
          <p className="info-text">Submit your new contribution to ABSTRACTU.</p>

          <div className="form-container">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                placeholder="Enter a title for your contribution"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Content</label>
              <textarea
                id="content"
                rows={10}
                placeholder="Write your contribution here..."
                className="form-textarea"
              ></textarea>
            </div>

            <div className="form-actions">
              <Link href="/contribute" className="cancel-button">
                Cancel
              </Link>
              <button className="submit-button">
                Save Draft
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
        
        .new-contribution-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80vh;
          padding: 2rem;
        }
        
        .new-contribution-card {
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
        
        .form-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        label {
          font-weight: bold;
          color: #e0e0e0;
        }
        
        .form-input, .form-textarea {
          padding: 0.75rem;
          background-color: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          color: #e0e0e0;
          font-family: inherit;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }
        
        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: #FFD700;
        }
        
        .form-textarea {
          resize: vertical;
          min-height: 200px;
        }
        
        .form-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 1rem;
        }
        
        .cancel-button, .submit-button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          font-size: 1rem;
        }
        
        .cancel-button {
          background-color: rgba(0, 0, 0, 0.3);
          color: #ccc;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .cancel-button:hover {
          background-color: rgba(0, 0, 0, 0.4);
        }
        
        .submit-button {
          background-color: #FFD700;
          color: #000;
          border: none;
        }
        
        .submit-button:hover {
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
          .form-actions {
            flex-direction: column;
            gap: 1rem;
          }
          
          .cancel-button, .submit-button {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
} 