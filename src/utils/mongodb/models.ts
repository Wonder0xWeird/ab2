/**
 * MongoDB Models for ABSTRACTU
 * Define all mongoose models and export them directly
 */
import mongoose from 'mongoose';

// Import schemas and interfaces
import { type INonce, nonceSchema } from './schemas/nonce';
import { type IContributionDraft, contributionDraftSchema } from './schemas/contributionDraft';
import { type IEvaluationResultCache, evaluationResultCacheSchema } from './schemas/evaluationResultCache';

// Clean up any existing models to prevent conflicts
// This is especially useful during development with hot reloading
if (mongoose.models) {
  delete mongoose.models.AuthNonce;
  delete mongoose.models.ContributionDraft;
  delete mongoose.models.EvaluationResultCache;
}

// Create models
const Nonce = mongoose.model<INonce>("AuthNonce", nonceSchema);
const ContributionDraft = mongoose.model<IContributionDraft>("ContributionDraft", contributionDraftSchema);
const EvaluationResultCache = mongoose.model<IEvaluationResultCache>("EvaluationResultCache", evaluationResultCacheSchema);

// Export models
export {
  Nonce,
  ContributionDraft,
  EvaluationResultCache,
  // Also export interfaces for use in other parts of the application
  INonce,
  IContributionDraft,
  IEvaluationResultCache
}; 