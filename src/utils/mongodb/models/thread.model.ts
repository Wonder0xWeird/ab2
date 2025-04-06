import mongoose, { Model } from 'mongoose';
import threadSchema, { IThread } from '../schemas/thread.schema';

const Thread: Model<IThread> =
  mongoose.models.Thread || mongoose.model<IThread>('Thread', threadSchema);

export default Thread; 