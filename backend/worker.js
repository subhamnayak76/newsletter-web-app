const { Worker } = require('bullmq');
const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);


const worker = new Worker('email-queue', async (job) => {
  const { email, title, content } = job.data;
    
  try {
    console.log(`Processing email for: ${email}`);
    await resend.emails.send({
      from: `${process.env.email}`,
      to: email,
      subject: title,
      html: `
        <h1>${title}</h1>
        <div>${content}</div>
        <p><a href="[unsubscribe-url]">Unsubscribe</a></p>
      `,
    });
    console.log(`Email sent successfully to: ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
    throw error;
  }
}, {
  concurrency: 5, 
  connection: {
    host: 'localhost',
    port: 6379
  }
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed for ${job.data.email}`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed for ${job?.data.email}:`, err);
});