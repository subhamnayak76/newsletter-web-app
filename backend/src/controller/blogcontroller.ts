import { Request, Response } from 'express';
import { Blog } from '../models/Blog';
import { User } from '../models/User';
import emailQueue from '../config/queue';


// export const createBlog = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const blog = new Blog({...req.body,isPublished:true});
//         await blog.save();
    
//         const subscribers = await User.find({ isSubscribed: true });
//         await Promise.all(
//           subscribers.map(user => 
//             emailQueue.add('newsletter', {
//               email: user.email,
//               title: `New Blog Post: ${blog.title}`,
//               content: `
//                 <h2>${blog.title}</h2>
//                 <p>By ${blog.author}</p>
//                 <div>${blog.content}</div>
//               `
//             })
//           )
//         );
//         res.status(201).json(blog);
//       } catch (error) {
//         res.status(500).json({ error: 'Failed to create blog' });
//       }
// }
export const createBlog = async (req: Request, res: Response): Promise<void> => {
  const session = await Blog.startSession();
  session.startTransaction();

  try {
    // Create blog with session to ensure atomic operation
    const blog = new Blog({ ...req.body, isPublished: true });
    await blog.save({ session });

    // Fetch subscribers
    const subscribers = await User.find({ isSubscribed: true });
    console.log(`Found ${subscribers.length} subscribers to notify`);

    // Queue emails with proper job options and tracking
    const emailJobs = await Promise.all(
      subscribers.map(async (user, index) => {
        const jobId = `blog-${blog._id}-user-${user._id}`;
        const jobData = {
          email: user.email,
          title: `New Blog Post: ${blog.title}`,
          content: `
            <h2>${blog.title}</h2>
            <p>By ${blog.author}</p>
            <div>${blog.content}</div>
          `
        };

        // Add job with specific options
        const job = await emailQueue.add('newsletter', jobData, {
          jobId,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000
          }
        });

        console.log(`Queued email job ${job.id} for user ${user.email} (${index + 1}/${subscribers.length})`);
        return job;
      })
    );

    // Commit the transaction
    await session.commitTransaction();
    
    // Return success with job tracking info
    res.status(201).json({
      blog,
      emailNotifications: {
        total: subscribers.length,
        queued: emailJobs.length,
        jobs: emailJobs.map(job => ({
          jobId: job.id,
          email: job.data.email,
          // metadata: job.opts.metadata // Removed because 'metadata' does not exist on type 'JobsOptions'
        }))
      }
    });

  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    
    console.error('Blog creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create blog',
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};

// Add a helper to check email job status
export const getEmailJobStatus = async (jobId: string) => {
  const job = await emailQueue.getJob(jobId);
  if (!job) return null;

  const state = await job.getState();
  return {
    jobId: job.id,
    state,
    attempts: job.attemptsMade,
    // metadata: job.opts.metadata, // Removed because 'metadata' does not exist on type 'JobsOptions'
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
  };
};

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

