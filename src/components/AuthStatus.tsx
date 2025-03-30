"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

/**
 * Displays the user's authentication status
 */
interface AuthStatusProps {
  className?: string;
}

export default function AuthStatus({ className = "" }: AuthStatusProps) {
  const { data: session } = useSession();

  // Determine the login URL - always use the main domain
  const getLoginUrl = () => {
    // If we're on the main domain, just use relative path
    if (typeof window !== 'undefined' && window.location.hostname === 'ab2.observer') {
      return "/auth/signin";
    }
    // Otherwise, use the absolute URL to the main domain
    return "https://ab2.observer/auth/signin";
  };

  return (
    <div className={className}>
      {session?.user ? (
        <span>
          Signed in as {session.user.name}
        </span>
      ) : (
        <Link href={getLoginUrl()} className="login-link">
          Sign In
        </Link>
      )}

      <style jsx>{`
        div {
          display: flex;
          align-items: center;
        }
        span {
          font-size: 0.875rem;
          font-weight: 500;
        }
        .login-link {
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          color: #FFD700;
        }
        .login-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
} 