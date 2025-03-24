/**
 * ContributionDraft model for ABSTRACTU
 * Manages draft contributions before they are published to the blockchain
 */
import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface for ContributionDraft document
 */
export interface IContributionDraft extends Document {
  // Core fields
  contributorAddress: string;
  title: string;
  description: string;
  content: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  status: string;

  // Relationships
  parentContributionId?: string;
  relatedContributionIds?: string[];

  // Blockchain references
  blockchainId?: number;
  filecoinCid?: string;

  // Evaluation
  evaluationStatus: string;
  evaluationScore?: number;
  evaluationFeedback?: string;
  evaluationTimestamp?: Date;
}

/**
 * Schema for ContributionDraft 
 */
const ContributionDraftSchema = new Schema<IContributionDraft>({
  // Core fields
  contributorAddress: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'pending', 'processing', 'approved', 'rejected'],
    default: 'draft',
    index: true
  },

  // Relationships
  parentContributionId: {
    type: String,
    index: true
  },
  relatedContributionIds: [{
    type: String
  }],

  // Blockchain references
  blockchainId: {
    type: Number
  },
  filecoinCid: {
    type: String
  },

  // Evaluation
  evaluationStatus: {
    type: String,
    enum: ['none', 'pending', 'completed'],
    default: 'none'
  },
  evaluationScore: {
    type: Number,
    min: 0,
    max: 100
  },
  evaluationFeedback: {
    type: String
  },
  evaluationTimestamp: {
    type: Date
  }
});

// Export the model (with safe model creation)
export const getContributionDraftModel = () => {
  const modelName = 'ContributionDraft';
  return mongoose.models[modelName] ||
    mongoose.model<IContributionDraft>(modelName, ContributionDraftSchema);
}; 