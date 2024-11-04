// src/models/Admin.ts
import mongoose, { Schema } from 'mongoose';
import { IAdmin } from '../types';

const adminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

export const Admin = mongoose.model<IAdmin>('Admin', adminSchema);