import mongoose, { Model } from 'mongoose';
import userSchema, { IUser } from '../schemas/user.schema';

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User; 