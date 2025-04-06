// Remove unused Module import
// import { Module } from 'module'; // Assuming this is the type for module
// Remove unused Session import
import { DefaultSession, User as DefaultUser, JWT as DefaultJWT } from 'next-auth';
// import { DefaultSession, User as DefaultUser, Session, JWT as DefaultJWT } from 'next-auth';
import { UserRole } from "@/utils/mongodb"; // Import UserRole enum

// Define enum for User Roles if not already defined elsewhere
// Ensure this matches the roles used in your User schema/model
enum UserRole {
  USER = 'user',
  SUPERADMIN = 'superadmin',
  SUPERUSER = 'superuser' // Add other roles as needed
}

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's wallet address. */
      address: string;
      /** The user's role. */
      role: UserRole;
      /** Custom JWT token */
      authToken?: string | null;
    } & DefaultSession['user'] // Include default fields like name, email, image if needed
  }

  // Extends the default User type
  interface User extends DefaultUser {
    role: UserRole;
    address: string; // Ensure address is part of the User type passed around
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    /** User role */
    role: UserRole;
    /** Wallet address */
    address: string;
    /** Issued at */
    iat?: number;
    /** Expiration time */
    exp?: number;
    /** JWT ID */
    jti?: string;
  }
} 