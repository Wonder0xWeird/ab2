import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";
import { UserRole } from "@/utils/mongodb"; // Import UserRole enum

// Define your custom user role enum or type if you haven't already
type UserRole = "superadmin" | "superuser" | "user"; // Match roles defined in authOptions

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's role. */
      role: UserRole;
      /** The user's wallet address. */
      address: string;
      /** Custom JWT token */
      authToken?: string | null;
    } & DefaultSession["user"]; // Keep the default properties like name, email, image
    error?: string | undefined; // Keep error property if needed
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends DefaultUser {
    role: UserRole;
    address: string; // Ensure address is part of the User type if you add it in authorize callback
    authToken: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    /** OpenID ID Token */
    role: UserRole;
    address: string;
    /** Custom JWT token */
    authToken?: string | null;
  }
} 