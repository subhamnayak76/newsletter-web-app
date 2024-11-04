
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin';
import dotenv from 'dotenv';
dotenv.config();
export const verifyAdmin = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<any> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || ''
    ) as { id: string };

    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      res.status(401).json({ error: 'Admin not found' });
      return;
    }

    req.body.adminId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};