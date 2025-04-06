/**
 * MongoDB Models for ABSTRACTU
 * Define all mongoose models and export them directly
 */
import mongoose from 'mongoose';

// Import interfaces and schemas
import { type INonce, nonceSchema } from './schemas/nonce'; // Existing
import {
  type IContributionDraft,
  contributionDraftSchema,
} from './schemas/contributionDraft'; // Existing
import {
  type IEvaluationResultCache,
  evaluationResultCacheSchema,
} from './schemas/evaluationResultCache'; // Existing
import conceptSchema, { type IConcept } from './schemas/concept.schema'; // New
import sentenceSchema, { type ISentence } from './schemas/sentence.schema'; // New
import threadSchema, { type IThread } from './schemas/thread.schema'; // New
import draftSchema, { type IDraft } from './schemas/draft.schema'; // New
import userSchema, { type IUser, UserRole } from './schemas/user.schema'; // New RBAC User

// NOTE: DB Connection (`MongoDBClient.getInstance().connect()`) should be handled
// elsewhere, e.g., in API route handlers or a central server setup file,
// not directly in this module scope.

// Define models, using the standard Mongoose pattern which handles
// model existence checks internally in newer versions/setups.
const AuthNonce: mongoose.Model<INonce> =
  mongoose.models.AuthNonce || mongoose.model<INonce>('AuthNonce', nonceSchema);

const ContributionDraft: mongoose.Model<IContributionDraft> =
  mongoose.models.ContributionDraft ||
  mongoose.model<IContributionDraft>(
    'ContributionDraft',
    contributionDraftSchema
  );

const EvaluationResultCache: mongoose.Model<IEvaluationResultCache> =
  mongoose.models.EvaluationResultCache ||
  mongoose.model<IEvaluationResultCache>(
    'EvaluationResultCache',
    evaluationResultCacheSchema
  );

const Concept: mongoose.Model<IConcept> =
  mongoose.models.Concept || mongoose.model<IConcept>('Concept', conceptSchema);

const Sentence: mongoose.Model<ISentence> =
  mongoose.models.Sentence ||
  mongoose.model<ISentence>('Sentence', sentenceSchema);

const Thread: mongoose.Model<IThread> =
  mongoose.models.Thread || mongoose.model<IThread>('Thread', threadSchema);

const Draft: mongoose.Model<IDraft> =
  mongoose.models.Draft || mongoose.model<IDraft>('Draft', draftSchema);

const User: mongoose.Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);

// Export models
export {
  AuthNonce,
  ContributionDraft,
  EvaluationResultCache,
  Concept,
  Sentence,
  Thread,
  Draft,
  User,
};

// Export types using 'export type' for isolatedModules compatibility
export type {
  INonce,
  IContributionDraft,
  IEvaluationResultCache,
  IConcept,
  ISentence,
  IThread,
  IDraft,
  IUser,
};

// Export enums directly
export { UserRole };