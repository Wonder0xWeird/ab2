import { Schema, Types } from 'mongoose';

// Interface representing a document in MongoDB.
export interface IThread {
  tid: number; // Sequential thread ID per semi-concept
  scid: number; // Sequential semi-concept ID per sentence
  sid: number; // Reference to Sentence.sid
  cid: string; // Reference to Concept.cid
  parentThreadId?: Types.ObjectId; // Reference to parent Thread._id (optional, for replies within a thread)
  weaverAddress: string; // Ethereum address (lowercase)
  content: string; // User comment (Markdown)
  publishedAt: Date;
}

// Schema corresponding to the document interface.
const threadSchema = new Schema<IThread>(
  {
    tid: { type: Number, required: true },
    scid: { type: Number, required: true },
    sid: { type: Number, required: true, index: true }, // Indexed for fetching threads by sentence
    cid: { type: String, required: true, index: true }, // Indexed for fetching threads by concept
    parentThreadId: { type: Schema.Types.ObjectId, ref: 'Thread', default: null },
    weaverAddress: { type: String, required: true, lowercase: true, index: true }, // Store as lowercase
    content: { type: String, required: true, maxlength: 333 }, // Enforce character limit
    publishedAt: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: false, // Using publishedAt instead
  }
);

// Compound index for efficient querying of threads within a sentence, grouped by semi-concept, ordered by thread ID
threadSchema.index({ cid: 1, sid: 1, scid: 1, tid: 1 }, { unique: true });
// Optional: Index for fetching all threads by a user
threadSchema.index({ weaverAddress: 1, publishedAt: -1 });

export default threadSchema; 