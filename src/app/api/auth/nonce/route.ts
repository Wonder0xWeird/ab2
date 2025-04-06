import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { MongoDBClient } from '@/utils/mongodb/client';
import { AuthNonce } from '@/utils/mongodb';

export async function GET() {
  try {
    // Connect to MongoDB
    const mongoClient = MongoDBClient.getInstance();
    await mongoClient.connect();

    // Generate a random UUID for the nonce
    const nonce = uuidv4();
    const timestamp = Math.floor(Date.now() / 1000);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Store the nonce with an expiration (10 minutes)
    const nonceDoc = new AuthNonce({
      nonce,
      timestamp,
      expires,
      createdAt: new Date(),
    });
    await nonceDoc.save();

    // Return the nonce to the client
    return NextResponse.json({
      nonce,
      timestamp,
      status: 'success'
    });
  } catch (error) {
    console.error('Error generating nonce:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to generate nonce' },
      { status: 500 }
    );
  }
} 