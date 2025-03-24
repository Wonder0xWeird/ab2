"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

/**
 * Auth provider component for wrapping the application with NextAuth session provider
 */
export default function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
} 