// src/types/index.ts
import { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  isSubscribed: boolean;
  createdAt: Date;
}

export interface IAdmin extends Document {
  email: string;
  password: string;
}

export interface IBlog extends Document {
  title: string;
  content: string;
  author: string;
  publishDate: Date;
  tags: string[];
  isPublished: boolean;
}