import { Schema/*, Types*/ } from 'mongoose';

// Enum for Markdown content types
export enum MarkdownType {
  Paragraph = 'paragraph',
  Heading1 = 'heading1',
  Heading2 = 'heading2',
  Heading3 = 'heading3',
  Heading4 = 'heading4',
  Heading5 = 'heading5',
  Heading6 = 'heading6',
  Code = 'code',
  ListItem = 'listItem',
  Blockquote = 'blockquote',
  HorizontalRule = 'horizontalRule',
  Image = 'image',
  // Add other markdown element types as needed
}

// --- Define explicit Metadata structure --- 
// Export the interface
export interface ISentenceMetadata {
  // For lists
  ordered?: boolean;
  start?: number;
  indentation?: number;
  itemNumber?: number; // Add field for ordered list item number
  // For code blocks
  lang?: string;
  meta?: string; // e.g., filename for code blocks
  // For images
  alt?: string;
  imageUrl?: string; // Store URL here instead of in content?
  // Add other type-specific metadata as needed
}

// Interface representing a document in MongoDB.
export interface ISentence {
  sid: number; // Sequential sentence ID per concept
  cid: string; // Reference to Concept
  psid?: number; // Previous sentence ID (null for the first sentence)
  nsid?: number; // Next sentence ID (null for the last sentence)
  content: string; // The actual text content (Markdown chunk)
  type: MarkdownType; // Type of Markdown element this represents
  publishedAt: Date;
  // Use the specific metadata interface
  metadata?: ISentenceMetadata;
}

// Schema corresponding to the document interface.
const sentenceSchema = new Schema<ISentence>(
  {
    sid: { type: Number, required: true },
    cid: { type: String, required: true, index: true }, // Reference Concept.cid
    psid: { type: Number, default: null },
    nsid: { type: Number, default: null },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(MarkdownType),
      required: true,
    },
    // Define metadata schema explicitly
    metadata: {
      type: {
        // List properties
        ordered: { type: Boolean, required: false },
        start: { type: Number, required: false },
        indentation: { type: Number, required: false },
        itemNumber: { type: Number, required: false },
        // Code properties
        lang: { type: String, required: false },
        meta: { type: String, required: false },
        // Image properties
        alt: { type: String, required: false },
        imageUrl: { type: String, required: false },
        // Add other fields as needed
      },
      required: false, // Metadata object itself is optional
      default: {}
    },
    publishedAt: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: false, // Using publishedAt instead
    // Compound index definition moved below
    // indexes: [{ fields: { cid: 1, sid: 1 }, unique: true }],
  }
);

// Define compound index for efficient querying within a concept and ordering
sentenceSchema.index({ cid: 1, sid: 1 }, { unique: true });

export default sentenceSchema; 