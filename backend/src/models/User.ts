
import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types';

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  isSubscribed: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', userSchema);