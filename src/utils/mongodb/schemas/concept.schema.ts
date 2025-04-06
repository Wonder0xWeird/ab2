import { Schema/*, Types*/ } from 'mongoose';

// Interface representing a document in MongoDB.
export interface IConcept {
  cid: string; // Unique concept ID (e.g., "w", "e", "z")
  title: string;
  description: string;
  createdAt: Date;
  coverImage?: string; // Optional cover image URL
  tags?: string[]; // Optional tags
}

// Schema corresponding to the document interface.
const conceptSchema = new Schema<IConcept>(
  {
    cid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^[a-z0-9]+$/, // Ensure cid is simple alphanumeric lowercase
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    coverImage: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } } // Automatically add createdAt
);

export default conceptSchema; 