import { Queue, QueueOptions } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

export const QUEUE_NAME = 'email-queue';

const queueOptions: QueueOptions = {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  }
  
};

// Create singleton queue instance
const emailQueue = new Queue(QUEUE_NAME, queueOptions);

// Add error handling
// emailQueue.on('error', (error: Error) => {
//     console.error('Queue error:', error);
//   });
  
//   emailQueue.on('failed', (job, error) => {
//     console.error(`Job ${job.id} failed:`, error);
//   });
  
export default emailQueue;