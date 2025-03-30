"use client";

import { useState, useEffect } from "react";
import { SiweMessage } from "siwe";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { getCsrfToken, signIn, useSession } from "next-auth/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";

// Create a separate client component that wraps the wallet functionality
function SignInContent() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCorrectDomain, setIsCorrectDomain] = useState(true);
  const [returnToContribute, setReturnToContribute] = useState(false);
  const [redirectInProgress, setRedirectInProgress] = useState(false);

  // Check URL parameters for returnToContribute flag - do this first
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('returnToContribute') === 'true') {
        console.log("Setting returnToContribute to true from URL parameter");
        setReturnToContribute(true);
      }
    }
  }, []);

  // Check if we're on an allowed domain - do this second
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      console.log("Current hostname:", hostname);

      // Check if we're on contribute subdomain
      const isContributeSubdomain = hostname === 'contribute.ab2.observer';

      // We're on a correct domain if it's the main domain
      const isMainDomain = hostname === 'ab2.observer';
      setIsCorrectDomain(isMainDomain);

      // For development, always handle as normal
      if (process.env.NODE_ENV === 'development') {
        console.log("In development mode, treating as correct domain");
        setIsCorrectDomain(true);
      }

      // Only set returnToContribute from hostname if not already set from URL parameter
      if (isContributeSubdomain && !returnToContribute) {
        console.log("Setting returnToContribute to true from hostname");
        setReturnToContribute(true);
      }
    }
  }, [returnToContribute]);

  // Handle authenticated user redirect
  useEffect(() => {
    // If the user is already signed in, redirect to the appropriate domain
    if (status === "authenticated" && session?.user?.address && !redirectInProgress) {
      console.log("User is authenticated, redirecting");
      setRedirectInProgress(true); // Prevent multiple redirects

      if (returnToContribute) {
        console.log("Redirecting to contribute subdomain");
        // Redirect to contribute subdomain
        if (process.env.NODE_ENV === 'development') {
          router.push("/contribute");
        } else {
          window.location.href = "https://contribute.ab2.observer";
        }
      } else {
        console.log("Redirecting to main domain contribute page");
        // Redirect to contribute page on main domain
        router.push("/contribute");
      }
    }
  }, [session, status, router, returnToContribute, redirectInProgress]);

  // Redirect to the main domain if needed
  useEffect(() => {
    // Only redirect if:
    // 1. We're not on the correct domain
    // 2. A redirect is not already in progress
    // 3. We're not already handling a returnToContribute parameter
    if (!isCorrectDomain &&
      !redirectInProgress &&
      typeof window !== 'undefined' &&
      !window.location.search.includes('returnToContribute=true')) {

      console.log("Need to redirect to main domain");
      setRedirectInProgress(true); // Prevent multiple redirects

      const currentPath = window.location.pathname;
      const queryParams = window.location.search;

      // Properly format the URL with the returnToContribute parameter
      const separator = queryParams ? '&' : '?';
      const redirectUrl = `https://ab2.observer${currentPath}${queryParams}${separator}returnToContribute=true`;

      console.log("Redirecting to main domain:", redirectUrl);
      window.location.href = redirectUrl;
    }
  }, [isCorrectDomain, redirectInProgress]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      // Safety check - only proceed if we're on the correct domain
      if (!isCorrectDomain) {
        throw new Error("Please sign in from the main domain");
      }

      // Get the CSRF token
      const csrfToken = await getCsrfToken();
      if (!csrfToken || !address) {
        throw new Error("Failed to get CSRF token or address not available");
      }

      // Fetch a nonce from our server
      const nonceResponse = await fetch('/api/auth/nonce');
      if (!nonceResponse.ok) {
        throw new Error("Failed to get nonce from server");
      }

      const { nonce, timestamp } = await nonceResponse.json();

      // Always use the main domain for SIWE
      const domain = 'ab2.observer';
      const origin = 'https://ab2.observer';

      // Create the SIWE message with a simplified statement (fewer newlines)
      const message = new SiweMessage({
        domain,
        address,
        statement: `Sign in to ABSTRACTU - Timestamp: ${timestamp} - Nonce: ${nonce}`,
        uri: origin,
        version: "1",
        chainId: 1,
        nonce: csrfToken, // CSRF token from NextAuth
        resources: [
          `${origin}/api/auth/nonce?nonce=${nonce}&timestamp=${timestamp}`
        ]
      });

      // Format the message
      const signableMessage = message.prepareMessage();
      console.log("Signing message:", signableMessage); // Debugging
      console.log("Domain used:", domain); // Debugging

      // Sign the message with the connected wallet
      const signature = await signMessageAsync({ message: signableMessage });

      // Send the signed message to NextAuth for verification
      const authResponse = await signIn("ethereum", {
        message: JSON.stringify(message),
        signature,
        timestamp: timestamp.toString(),
        nonce,
        redirect: false,
      });

      if (authResponse?.error) {
        console.error("Error during sign-in:", authResponse.error);
        setError(authResponse.error);
        throw new Error(authResponse.error);
      }

      // Prevent redirect loop by setting a flag
      setRedirectInProgress(true);
      console.log("Authentication successful, preparing to redirect");

      // Redirect after successful sign-in based on origin
      if (returnToContribute) {
        console.log("Redirecting to contribute subdomain after successful sign-in");
        // For development, use router
        if (process.env.NODE_ENV === 'development') {
          router.push("/contribute");
        } else {
          // For production, redirect to subdomain
          window.location.href = "https://contribute.ab2.observer";
        }
      } else {
        console.log("Redirecting to main domain contribute page after successful sign-in");
        // Standard redirect to main domain's contribute page
        router.push("/contribute");
      }
    } catch (error: unknown) {
      console.error("Error signing in with Ethereum:", error);
      setError(error instanceof Error ? error.message : "Failed to sign in");

      // Disconnect on error
      disconnect();
    } finally {
      setLoading(false);
    }
  };

  // Don't render the form if we're not on the correct domain - it will redirect
  if (!isCorrectDomain) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Redirecting to secure sign-in...</h1>
        </div>
        <style jsx>{`
          .auth-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 70vh;
          }
          
          .auth-card {
            background-color: rgba(30, 30, 30, 0.8);
            backdrop-filter: blur(10px);
            border-radius: 8px;
            padding: 2rem;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            text-align: center;
          }
          
          h1 {
            margin-bottom: 1rem;
            font-size: 1.8rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Sign In to ABSTRACTU</h1>
        <p className="auth-description">
          Connect your wallet and sign a message to authenticate with ABSTRACTU.
          This allows you to create and manage contributions securely.
        </p>

        <div className="connect-container">
          <ConnectButton
            showBalance={false}
          />
        </div>

        {isConnected && (
          <button
            disabled={loading}
            onClick={handleSignIn}
            className="sign-button"
          >
            {loading ? "Signing..." : "Sign-in with Ethereum"}
          </button>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      <style jsx>{`
        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 70vh;
        }
        
        .auth-card {
          background-color: rgba(30, 30, 30, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          padding: 2rem;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          text-align: center;
        }
        
        h1 {
          margin-bottom: 1rem;
          font-size: 1.8rem;
        }
        
        .auth-description {
          margin-bottom: 2rem;
          color: #ccc;
          line-height: 1.5;
        }
        
        .connect-container {
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: center;
        }
        
        .sign-button {
          background-color: #FFD700;
          color: #000;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }
        
        .sign-button:hover {
          background-color: #E6C200;
        }
        
        .sign-button:disabled {
          background-color: #665c00;
          cursor: not-allowed;
        }
        
        .error-message {
          margin-top: 1rem;
          padding: 0.75rem;
          background-color: rgba(220, 53, 69, 0.2);
          color: #ff6b6b;
          border-radius: 4px;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}

// Main component that handles the client-side mounting
export default function SignIn() {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering component after client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render the wallet components until client-side hydration is complete
  if (!mounted) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Loading...</h1>
        </div>
        <style jsx>{`
          .auth-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 70vh;
          }
          
          .auth-card {
            background-color: rgba(30, 30, 30, 0.8);
            backdrop-filter: blur(10px);
            border-radius: 8px;
            padding: 2rem;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            text-align: center;
          }
          
          h1 {
            margin-bottom: 1rem;
            font-size: 1.8rem;
          }
        `}</style>
      </div>
    );
  }

  // Only render the SignInContent component on the client side
  return <SignInContent />;
} 