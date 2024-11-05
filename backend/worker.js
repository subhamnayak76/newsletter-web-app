// const { Worker } = require('bullmq');
// const { Resend } = require('resend');
// require('dotenv').config();

// const resend = new Resend(process.env.RESEND_API_KEY);

// const worker = new Worker('email-queue', async (job) => {
//   const { email, title, content } = job.data;
    
//   try {
//     console.log(`Processing email for: ${email}`);
//     await resend.emails.send({
//       from: process.env.email,
//       to: email,
//       subject: title,
//       html: `
//         <h1>${title}</h1>
//         <div>${content}</div>
//         <p><a href="[unsubscribe-url]">Unsubscribe</a></p>
//       `,
//     });
//     console.log(`Email sent successfully to: ${email}`);
//     return { success: true, email };
//   } catch (error) {
//     console.error(`Failed to send email to ${email}:`, error);
//     throw error;
//   }
// }, {
//   concurrency: 10,
//   connection: {
//     host: 'brave-dog-21924.upstash.io',
//     port: 6379,
//     password : '',
//     tls :{},
//     maxRetriesPerRequest: 3,
//     retryStrategy: (times) => {
//       return Math.min(times * 1000, 3000);
//     }
//   },
//   lockDuration: 30000, 
//   stallInterval: 5000,
// });

// let processedCount = 0;
// const totalJobs = 3; 

// worker.on('completed', (job) => {
//   processedCount++;
//   console.log(`Job ${job.id} completed for ${job.data.email} (${processedCount}/${totalJobs})`);
// });

// worker.on('failed', (job, err) => {
//   console.error(`Job ${job?.id} failed for ${job?.data.email}:`, err);
  
//   if (job && job.attemptsMade < 3) {
//     job.retry();
//   }
// });


// worker.on('error', (err) => {
//   console.error('Worker error:', err);
// });

// process.on('SIGTERM', async () => {
//   await worker.close();
// });
const { Worker } = require('bullmq');
const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

const worker = new Worker('email-queue', async (job) => {
  const { email, title, content } = job.data;
  const { blogId, userId, emailIndex, totalEmails } = job.opts.metadata || {};

  try {
    // Log start of processing with job metadata
    console.log(`[Job ${job.id}] Processing email ${emailIndex}/${totalEmails} for: ${email}`);
    
    // Update job progress
    await job.updateProgress(50);

    const result = await resend.emails.send({
      from: process.env.email,
      to: email,
      subject: title,
      html: `
        <h1>${title}</h1>
        <div>${content}</div>
        <p><a href="[unsubscribe-url]">Unsubscribe</a></p>
      `,
    });

    // Log success with metadata
    console.log(`[Job ${job.id}] Email sent successfully to: ${email}`);
    
    // Return detailed result
    return { 
      success: true, 
      email,
      resendId: result.id,
      metadata: { blogId, userId, emailIndex, totalEmails }
    };

  } catch (error) {
    console.error(`[Job ${job.id}] Failed to send email  to ${email}:`, error);
    throw error;
  }
}, {
  connection: {
    host: 'localhost',
    port: 6379,
    // password: process.env.,
    // tls: {},
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      return Math.min(times * 1000, 3000);
    }
  },
  
  concurrency: 5,
  
  lockDuration: 30000,
  stallInterval: 5000,
});

// Enhanced error handling
worker.on('completed', (job) => {
  const { emailIndex, totalEmails } = job.opts.metadata || {};
  console.log(`[Worker] Job ${job.id} completed (${emailIndex}/${totalEmails})`);
});

worker.on('failed', (job, err) => {
  const { emailIndex, totalEmails } = job.opts.metadata || {};
  console.error(`[Worker] Job ${job.id} failed (${emailIndex}/${totalEmails}):`, err);
});

worker.on('error', (err) => {
  console.error('[Worker] Worker error:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Worker] Shutting down...');
  await worker.close();
});