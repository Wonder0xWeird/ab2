"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/signin");
  }, [router]);

  return (
    <div className="redirect-container">
      <p>Redirecting to sign in...</p>

      <style jsx>{`
        .redirect-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 70vh;
          font-size: 1.2rem;
          color: #ccc;
        }
      `}</style>
    </div>
  );
} 