"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";

type AuthStatusProps = {
  className?: string;
};

export default function AuthStatus({ className = "" }: AuthStatusProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDashboardClick = () => {
    router.push("/dashboard");
  };

  // Don't render wallet components before client-side hydration is complete
  if (!mounted) {
    return <div className={`auth-status ${className}`}></div>;
  }

  return (
    <div className={`auth-status ${className}`}>
      {status === "authenticated" && session?.user ? (
        <div className="authenticated">
          <span className="address-display">
            {session.user.address?.substring(0, 6)}...{session.user.address?.substring(38)}
          </span>
          <button className="dashboard-button" onClick={handleDashboardClick}>
            Dashboard
          </button>
        </div>
      ) : (
        <div className="unauthenticated">
          <ConnectButton
            showBalance={false}
          />
        </div>
      )}

      <style jsx>{`
        .auth-status {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .authenticated {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .address-display {
          background-color: rgba(0, 0, 0, 0.3);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-family: monospace;
          font-size: 0.9rem;
        }

        .dashboard-button {
          background-color: #FFD700;
          color: #000;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dashboard-button:hover {
          background-color: #E6C200;
        }
      `}</style>
    </div>
  );
} 