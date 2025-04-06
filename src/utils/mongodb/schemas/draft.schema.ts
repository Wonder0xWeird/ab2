import { Schema, Types } from 'mongoose';

export enum DraftType {
  Concept = 'concept',
  Thread = 'thread',
}

// Interface representing a document in MongoDB.
export interface IDraft {
  did: string; // Unique draft ID (e.g., UUID)
  authorAddress: string; // Ethereum address (lowercase)
  type: DraftType; // Type of draft (concept or thread)
  // Target references (optional, depending on type)
  cid?: string; // Target Concept ID (for thread drafts, or concept drafts if updating)
  sid?: number; // Target Sentence ID (for thread drafts)
  scid?: number; // Target Semi-Concept ID (for thread replies)
  parentThreadId?: Types.ObjectId; // Target Parent Thread ID (for thread replies)
  // Content
  content: string; // Markdown content
  createdAt: Date;
  updatedAt: Date;
}

// Schema corresponding to the document interface.
const draftSchema = new Schema<IDraft>(
  {
    did: { type: String, required: true, unique: true, index: true },
    authorAddress: { type: String, required: true, lowercase: true, index: true },
    type: { type: String, enum: Object.values(DraftType), required: true },
    cid: { type: String, index: true },
    sid: { type: Number, index: true },
    scid: { type: Number, index: true },
    parentThreadId: { type: Schema.Types.ObjectId, ref: 'Thread' },
    content: { type: String, required: true },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt
);

// Index for efficiently finding drafts by author
draftSchema.index({ authorAddress: 1, updatedAt: -1 });

export default draftSchema; 