import mongoose, { Model } from 'mongoose';
import draftSchema, { IDraft } from '../schemas/draft.schema';

const Draft: Model<IDraft> =
  mongoose.models.Draft || mongoose.model<IDraft>('Draft', draftSchema);

export default Draft; 