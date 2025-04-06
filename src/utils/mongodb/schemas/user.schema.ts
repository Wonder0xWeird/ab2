import { Schema } from 'mongoose';

export enum UserRole {
  SUPERADMIN = 'superadmin', // w0nd3r
  SUPERUSER = 'superuser', // ACRONTU
  USER = 'user',
}

// Interface representing a user document in MongoDB.
export interface IUser {
  walletAddress: string; // Ethereum address (lowercase)
  role: UserRole;
  createdAt: Date;
  lastLogin: Date;
}

// Schema corresponding to the document interface.
const userSchema = new Schema<IUser>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      default: UserRole.USER,
    },
    lastLogin: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false }, // Only add createdAt automatically
  }
);

export default userSchema; 