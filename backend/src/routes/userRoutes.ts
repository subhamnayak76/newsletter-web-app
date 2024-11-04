// src/routes/userRoutes.ts
import { Router } from 'express';
import { subscribe } from '../controller/usercontroller';

const router = Router();

router.post('/subscribe', subscribe);

export default router;