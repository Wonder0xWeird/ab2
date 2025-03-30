import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";
import { MongoDBClient, Nonce } from '@/utils/mongodb';
import { generateAuthToken } from "./middleware";

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
          if (!credentials?.message || !credentials?.signature || !credentials?.timestamp || !credentials?.nonce) {
            throw new Error("Missing credentials");
          }

          // Connect to MongoDB
          const mongoClient = MongoDBClient.getInstance();
          await mongoClient.connect();

          // Check that the timestamp is not too old (5 minutes)
          const timestamp = parseInt(credentials.timestamp);
          const currentTime = Math.floor(Date.now() / 1000);
          if (currentTime - timestamp > 5 * 60) {
            throw new Error("Expired");
          }

          // Get the nonce model and verify the nonce
          const nonceRecord = await Nonce.findOne({
            nonce: credentials.nonce,
            timestamp: timestamp
          });

          if (!nonceRecord) {
            throw new Error("Invalid");
          }

          // Delete the nonce to prevent replay attacks
          await Nonce.deleteOne({
            nonce: credentials.nonce,
            timestamp: timestamp
          });

          // Parse and verify the SIWE message
          const siwe = new SiweMessage(JSON.parse(credentials.message));
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL || "http://localhost:3000");

          // Extract just the hostname (e.g., "ab2.observer")
          const domain = nextAuthUrl.hostname.split('.').slice(-2).join('.');

          console.log("Expected domain:", domain);
          console.log("Message domain:", siwe.domain);

          const result = await siwe.verify({
            signature: credentials.signature,
            domain: domain,
            nonce: await getCsrfToken({ req }),
          });

          if (result.success) {
            // Generate JWT with user address
            const token = generateAuthToken(siwe.address.toLowerCase());

            return {
              id: siwe.address,
              name: siwe.address.substring(0, 8) + '...' + siwe.address.substring(36),
              address: siwe.address.toLowerCase(),
              authToken: token,
            };
          }
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
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.address = token.sub?.toLowerCase();
        session.user.authToken = token.authToken;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
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
}; 