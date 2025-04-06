import { AuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SiweMessage } from 'siwe';
import { getCsrfToken } from 'next-auth/react';
import { MongoDBClient } from '@/utils/mongodb/client';
import { AuthNonce, User, UserRole, IUser } from '@/utils/mongodb'; // Import User model and role enum
import { generateAuthToken } from "./middleware";

// Define the main domain as a constant to ensure consistency
const MAIN_DOMAIN = 'ab2.observer';

// Extend NextAuthUser type to include our custom fields
interface ExtendedUser extends NextAuthUser {
  address: string;
  role: UserRole;
  authToken: string;
}

/**
 * NextAuth configuration for Sign-In with Ethereum
 */
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "ethereum",
      name: "Ethereum",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
        timestamp: { label: "Timestamp", type: "text" },
        nonce: { label: "Nonce", type: "text" },
      },
      async authorize(credentials, req): Promise<ExtendedUser | null> { // Return ExtendedUser
        try {
          const csrfToken = await getCsrfToken({ req });
          console.log("SIWE authorization attempt with CSRF token:", csrfToken);

          if (!credentials?.message || !credentials?.signature || !credentials?.timestamp || !credentials?.nonce) {
            console.error("SIWE missing credentials");
            throw new Error("Missing credentials");
          }

          // Connect to MongoDB
          const mongoClient = MongoDBClient.getInstance();
          await mongoClient.connect();

          // Check timestamp validity (e.g., 5 minutes)
          const providedTimestamp = parseInt(credentials.timestamp);
          const currentTime = Math.floor(Date.now() / 1000);
          if (currentTime - providedTimestamp > 5 * 60) {
            console.error("SIWE timestamp expired");
            throw new Error("Expired");
          }

          // Verify the nonce
          const nonceEntry = await AuthNonce.findOneAndDelete({ nonce: credentials.nonce }).exec();
          if (!nonceEntry) {
            console.error("SIWE invalid nonce");
            throw new Error("Invalid nonce or nonce expired");
          }

          const siwe = new SiweMessage(JSON.parse(credentials.message));
          const result = await siwe.verify({
            signature: credentials.signature,
            domain: MAIN_DOMAIN,
            nonce: csrfToken, // Verify against the actual CSRF token
          });

          if (!result.success) {
            console.error("SIWE verification failed:", result.error);
            throw new Error(`SIWE verification failed: ${result.error?.type || 'Unknown error'}`);
          }

          console.log("SIWE verification successful for:", siwe.address.toLowerCase());

          // --- Find or Create User and Assign Role --- Start
          const userAddress = siwe.address.toLowerCase();
          let user = await User.findOne({ walletAddress: userAddress }).exec();

          if (!user) {
            console.log(`Creating new user record for ${userAddress} with default role 'user'.`);
            user = new User({
              walletAddress: userAddress,
              role: UserRole.USER, // Always create new users with default role
              lastLogin: new Date(),
            });
            await user.save();
          } else {
            console.log(`Found user ${userAddress}. Updating lastLogin.`);
            // Update last login time ONLY. Do not overwrite role.
            user.lastLogin = new Date();
            await user.save();
          }
          // --- Find or Create User and Assign Role --- End

          // Generate internal JWT
          const internalToken = generateAuthToken(userAddress);

          // Return the extended user object for NextAuth
          return {
            id: user.walletAddress, // Use address as id
            name: user.walletAddress.substring(0, 6) + '...' + user.walletAddress.substring(user.walletAddress.length - 4),
            address: user.walletAddress,
            role: user.role, // Use the role fetched/created from the DB
            authToken: internalToken,
          };

        } catch (error: any) {
          console.error("Error during SIWE authorization:", error.message);
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
      console.log("Session callback, token data:", { sub: token.sub, role: token.role });
      // Add custom properties to the session object
      if (session.user && token.sub) {
        session.user.address = token.sub.toLowerCase();
        session.user.authToken = token.authToken as string;
        session.user.role = token.role as UserRole;
        // Remove default fields if not needed
        // delete session.user.name;
        // delete session.user.email;
        // delete session.user.image;
      }
      return session;
    },
    async jwt({ token, user }) {
      // Persist the data from authorize to the token
      if (user) {
        const extendedUser = user as ExtendedUser; // Cast user to our extended type
        console.log("JWT callback, setting token from user:", extendedUser.address, extendedUser.role);
        // Ensure address exists on user before assigning to token.sub
        if (extendedUser.address) {
          token.sub = extendedUser.address;
        }
        token.authToken = extendedUser.authToken;
        token.role = extendedUser.role;
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