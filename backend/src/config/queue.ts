
import { Queue, QueueOptions } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

export const QUEUE_NAME = 'email-queue';

const queueOptions: QueueOptions = {
  connection: {
    host: 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    // password: process.env.REDIS_PASSWORD ||'',
    // tls: {},
    
    enableOfflineQueue: false,

    retryStrategy: (times: number) => {
      return Math.max(Math.min(Math.exp(times), 20000), 1000);
    },

    maxRetriesPerRequest: 3
  },
  
  defaultJobOptions: {
    
    attempts: 3,
    
    backoff: {
      type: 'exponential',
      delay: 1000
    },
  
    removeOnComplete: {
      age: 24 * 3600, 
      count: 1000 
    },
    
    removeOnFail: {
      age: 7 * 24 * 3600,
      count: 5000 
    }
  }
};


const emailQueue = new Queue(QUEUE_NAME, queueOptions);


emailQueue.on('error', (error: Error) => {
  console.error('[Queue] Error:', error);
});

// emailQueue.on('failed', (job, error) => {
//   console.error(`[Queue] Job ${job.id} failed:`, error);
// });

emailQueue.on('removed', (job) => {
  console.log(`[Queue] Job ${job.id} removed`);
});

export default emailQueue;