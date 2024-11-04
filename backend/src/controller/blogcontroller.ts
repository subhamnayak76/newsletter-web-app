import { Request, Response } from 'express';
import { Blog } from '../models/Blog';
import { User } from '../models/User';
import emailQueue from '../config/queue';


export const createBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        const blog = new Blog({...req.body,isPublished:true});
        await blog.save();
    
        const subscribers = await User.find({ isSubscribed: true });
        await Promise.all(
          subscribers.map(user => 
            emailQueue.add('newsletter', {
              email: user.email,
              title: `New Blog Post: ${blog.title}`,
              content: `
                <h2>${blog.title}</h2>
                <p>By ${blog.author}</p>
                <div>${blog.content}</div>
              `
            })
          )
        );
        res.status(201).json(blog);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create blog' });
      }
}


export const getBlogs = async (_req: Request, res: Response) => {
    try {
        const blogs = await Blog.find({});
        res.json(blogs);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blogs' });
      }
    }


export const getBlogById = async (req: Request, res: Response) :Promise<any> => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
          return res.status(404).json({ error: 'Blog not found' });
        }
        res.json(blog);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blog' });
      }
}    

