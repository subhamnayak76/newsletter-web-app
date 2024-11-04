// src/routes/authRoutes.ts
import { Router } from 'express';
import { login } from '../controller/authcontroller';

const router = Router();

router.post('/login', login);

export default router;