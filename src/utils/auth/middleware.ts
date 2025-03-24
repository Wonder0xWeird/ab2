import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * Interface for the authenticated user
 */
export interface AuthenticatedUser {
  address: string;
  expiration: number;
}

/**
 * Authentication middleware for API routes
 * Verifies the JWT token and returns the user data
 * 
 * @param request The Next.js request object
 * @returns The authenticated user or null if authentication fails
 */
export async function authMiddleware(request: NextRequest): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET || 'development-secret';
    const decoded = jwt.verify(token, jwtSecret) as {
      address: string;
      exp: number;
    };

    // Check if token is expired
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      address: decoded.address,
      expiration: decoded.exp
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

/**
 * Generate a JWT token for a wallet address
 * 
 * @param address Ethereum wallet address
 * @param expiresIn Token expiration time (e.g., '1d', '7d')
 * @returns The generated JWT token
 */
export function generateAuthToken(address: string, expiresIn: string = '7d'): string {
  const jwtSecret = process.env.JWT_SECRET || 'development-secret';

  const token = jwt.sign(
    {
      address,
    },
    jwtSecret,
    { expiresIn }
  );

  return token;
} 