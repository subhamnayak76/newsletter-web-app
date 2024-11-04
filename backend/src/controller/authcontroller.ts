// src/controllers/authController.ts
import { Request, Response } from 'express';
import { Admin } from '../models/Admin';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const login = async (req: Request, res: Response) :Promise<any> => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || '');
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};