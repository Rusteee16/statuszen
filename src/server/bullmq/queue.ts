import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import axios from 'axios';

const connection = new IORedis();

export const componentStatusQueue = new Queue('componentStatusQueue', { connection });

export const worker = new Worker('componentStatusQueue', async job => {
  console.log(`Pinging component: ${job.data.url}`);
  try {
    const response = await axios.get(job.data.url, { timeout: 5000 });
    const status = response.status === 200 ? 'operational' : 'degraded';
    return { status };
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error pinging ${job.data.url}:`, error.message);
    } else {
      console.error(`Error pinging ${job.data.url}:`, error);
    }
    return { status: 'down' };
  }
}, { connection });