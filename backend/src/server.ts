import express, { Request, Response } from "express";
import { Resend } from "resend";
import { Queue } from 'bullmq';
import mongoose, { Document } from "mongoose";
import cors from "cors";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// Types
interface IUser extends Document {
  email: string;
  isSubscribed: boolean;
  createdAt: Date;
}
interface IAdmin extends Document {
  email: string;
  password: string;
}

interface IBlog extends Document {
  title: string;
  content: string;
  author: string;
  publishDate: Date;
  tags: string[];
  isPublished: boolean;
}

interface PublishParams {
  id: string;
}

// App setup
const app = express();
app.use(express.json());
app.use(cors());

// Email setup


// Queue setup
const emailQueue = new Queue('email-queue', {
  connection: {
    host: 'localhost',
    port: 6379
  }
});

// Database
mongoose.connect('')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  isSubscribed: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
})

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  publishDate: { type: Date, default: Date.now },
  tags: [String],
  isPublished: { type: Boolean, default: false }
});

// Models
const User = mongoose.model<IUser>('User', userSchema);
const Blog = mongoose.model<IBlog>('Blog', blogSchema);
const Admin = mongoose.model<IAdmin>('Admin', adminSchema);

//middleware
const verifyAdmin = async (req: Request, res: Response, next: Function): Promise<any> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { id: string };
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.body.adminId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};


// Routes
app.post('/api/subscribe', async (req: Request, res: Response) => {
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
});

app.post('/api/blogs', verifyAdmin ,async (req: Request, res: Response) => {
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
});

app.get('/api/blogs', async (_req: Request, res: Response) => {
  try {
    const blogs = await Blog.find({});
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});
app.post('/api/admin/login',async (req :Request,res:Response):Promise<any>=>{
  
    const {email,password}=req.body;
    try{
    if(!email || !password){
      return res.status(400).json({error:'Email and password required'});
    }
    const admin = await Admin.findOne({email});
    if(!admin || !await bcrypt.compare(password, admin.password)){
      return res.status(404).json({error:'Admin not found'});
    }
    const token = jwt.sign({ id: admin._id }, "mysupersecret");
    res.json({token});
    }catch(error){
      res.status(500).json({ error: 'Login failed' ,msg :`${error}`});
    }
  
})

// app.post('/api/publish/:id', async (req: Request<PublishParams>, res: Response): Promise<any> => {
//   try {
//     const blog = await Blog.findByIdAndUpdate(
//       req.params.id,
//       { isPublished: true },
//       { new: true }
//     );
//     if (!blog) {
//       return res.status(404).json({ error: 'Blog not found' });
//     }
    
   
    
//     res.json(blog);
//   } catch (error) {
//     res.status(500).json({ error: 'Publication failed' });
//   }
// });
app.get('/api/blogs/:id', async (req: Request, res: Response):Promise<any> => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

// Admin-only routes
app.put('/api/blogs/:id', verifyAdmin, async (req: Request, res: Response):Promise<any> => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

app.delete('/api/blogs/:id', verifyAdmin, async (req: Request, res: Response) :Promise<any>=> {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});