// src/routes/blogRoutes.ts
import { Router } from 'express';
import { createBlog, getBlogs, getBlogById } from '../controller/blogcontroller';
import { verifyAdmin } from '../middleware/auth';

const router = Router();

router.post('/', verifyAdmin, createBlog);
router.get('/', getBlogs);
router.get('/:id', getBlogById);

export default router;