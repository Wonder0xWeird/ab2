/**
 * Nonce schema for ABSTRACTU
 * Used for SIWE authentication to prevent replay attacks
 */
import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface for AuthNonce document
 */
export interface INonce extends Document {
  nonce: string;
  timestamp: Date;
  expires: Date;
}

/**
 * Schema for AuthNonce
 */
export const nonceSchema = new Schema<INonce>({
  nonce: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  expires: {
    type: Date,
    required: true,
    index: true,
    expires: 0 // TTL index: removes documents when current time > expires
  }
}); 