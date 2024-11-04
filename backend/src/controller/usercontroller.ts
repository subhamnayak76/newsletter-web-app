// src/controllers/userController.ts
import { Request, Response } from 'express';
import { User } from '../models/User';
import emailQueue from '../config/queue';

export const subscribe = async (req: Request, res: Response) => {
  try {
    const user = new User({ email: req.body.email });
    await user.save();
    await emailQueue.add('welcome-email', {
      email: req.body.email,
      title: 'Welcome to Newsletter',
      content: `
        <h2>Welcome to our Newsletter!</h2>
        <p>Thank you for subscribing to our newsletter. We're excited to have you on board!</p>
        <p>You'll receive updates about our latest blog posts and news.</p>
      `
    });
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Subscription failed' });
  }
};