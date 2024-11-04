
import mongoose, { Schema } from 'mongoose';
import { IBlog } from '../types';

const blogSchema = new Schema<IBlog>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  publishDate: { type: Date, default: Date.now },
  tags: [String],
  isPublished: { type: Boolean, default: false }
});

export const Blog = mongoose.model<IBlog>('Blog', blogSchema);