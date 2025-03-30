import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";
import { MongoDBClient, Nonce } from '@/utils/mongodb';
import { generateAuthToken } from "./middleware";

// Define the main domain as a constant to ensure consistency
const MAIN_DOMAIN = 'ab2.observer';

/**
 * NextAuth configuration for Sign-In with Ethereum
 */
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "ethereum",
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
        },
        signature: {
          label: "Signature",
          type: "text",
        },
        timestamp: {
          label: "Timestamp",
          type: "text",
        },
        nonce: {
          label: "Nonce",
          type: "text",
        },
      },
      async authorize(credentials, req) {
        try {
          console.log("SIWE authorization attempt with CSRF token:", await getCsrfToken({ req }));

          if (!credentials?.message || !credentials?.signature || !credentials?.timestamp || !credentials?.nonce) {
            console.error("SIWE missing credentials");
            throw new Error("Missing credentials");
          }

          // Connect to MongoDB
          const mongoClient = MongoDBClient.getInstance();
          await mongoClient.connect();

          // Check that the timestamp is not too old (5 minutes)
          const timestamp = parseInt(credentials.timestamp);
          const currentTime = Math.floor(Date.now() / 1000);
          if (currentTime - timestamp > 5 * 60) {
            console.error("SIWE timestamp expired");
            throw new Error("Expired");
          }

          // Get the nonce model and verify the nonce
          const nonceRecord = await Nonce.findOne({
            nonce: credentials.nonce,
            timestamp: timestamp
          });

          if (!nonceRecord) {
            console.error("SIWE invalid nonce");
            throw new Error("Invalid");
          }

          // Delete the nonce to prevent replay attacks
          await Nonce.deleteOne({
            nonce: credentials.nonce,
            timestamp: timestamp
          });

          // Parse and verify the SIWE message
          const siwe = new SiweMessage(JSON.parse(credentials.message));

          // Always use our main domain for verification
          const domain = MAIN_DOMAIN;

          console.log("Expected domain:", domain);
          console.log("Message domain:", siwe.domain);
          console.log("User address:", siwe.address.toLowerCase());

          const result = await siwe.verify({
            signature: credentials.signature,
            domain: domain,
            nonce: await getCsrfToken({ req }),
          });

          if (result.success) {
            console.log("SIWE verification successful for:", siwe.address.toLowerCase());

            // Generate JWT with user address
            const token = generateAuthToken(siwe.address.toLowerCase());

            return {
              id: siwe.address,
              name: siwe.address.substring(0, 8) + '...' + siwe.address.substring(36),
              address: siwe.address.toLowerCase(),
              authToken: token,
            };
          }

          console.error("SIWE verification failed:", result);
          return null;
        } catch (error) {
          console.error("Error during SIWE authorization:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    // Configure cookies to work across subdomains
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.ab2.observer' : undefined,
      },
    },
  },
  callbacks: {
    async session({ session, token }) {
      console.log("Session callback, user:", session?.user?.address || "no user");
      if (session.user) {
        session.user.address = token.sub?.toLowerCase();
        session.user.authToken = token.authToken;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        console.log("JWT callback, setting user:", user.address);
        token.sub = user.address;
        token.authToken = user.authToken;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}; 