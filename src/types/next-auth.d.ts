import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** User's Ethereum wallet address */
      address?: string;
      /** Custom authorization token for API calls */
      authToken?: string;
    } & DefaultSession["user"];
  }

  interface User {
    address: string;
    authToken: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** Custom authorization token for API calls */
    authToken?: string;
  }
} 