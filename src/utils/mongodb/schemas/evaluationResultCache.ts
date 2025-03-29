/**
 * EvaluationResultCache schema for ABSTRACTU
 * Stores cached evaluation results from foundation models
 */
import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface for EvaluationResultCache document
 */
export interface IEvaluationResultCache extends Document {
  contributionId: string;
  modelId: string;
  criteria: string;
  score: number;
  feedback: string;
  timestamp: Date;
  version: string;
}

/**
 * Schema for EvaluationResultCache 
 */
export const evaluationResultCacheSchema = new Schema<IEvaluationResultCache>({
  contributionId: {
    type: String,
    required: true,
    index: true
  },
  modelId: {
    type: String,
    required: true
  },
  criteria: {
    type: String,
    required: true,
    enum: ['novelty', 'usefulness', 'coherence', 'overall']
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  feedback: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  version: {
    type: String,
    required: true
  }
});

// Compound index for faster lookups
evaluationResultCacheSchema.index({ contributionId: 1, modelId: 1, criteria: 1 }); 