import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import axios from 'axios';

// Redis Connection Setup
const connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
});

export type ComponentStatus =
  | "OPERATIONAL"
  | "PERFORMANCE_ISSUES"
  | "PARTIAL_OUTAGE"
  | "MAJOR_OUTAGE"
  | "UNKNOWN";

interface Component {
  id: string;
  url: string;
}

// Initialize BullMQ Queue
export const componentQueue = new Queue('componentQueue', { connection });

// Function to derive status from HTTP response code
function deriveStatusFromHttp(httpCode: number): ComponentStatus {
  if (httpCode === 0) return "MAJOR_OUTAGE";
  if (httpCode >= 200 && httpCode < 300) return "OPERATIONAL";
  if (httpCode >= 300 && httpCode < 400) return "OPERATIONAL";
  if (httpCode >= 400 && httpCode < 500) return "PERFORMANCE_ISSUES";
  if (httpCode >= 500) return "PARTIAL_OUTAGE";
  return "UNKNOWN";
}

// Add component to queue with optional delay
export const addComponentToQueue = async (component: Component, delay = 0): Promise<void> => {
  await componentQueue.add('pingComponent', component, { delay });
};

// Worker to process components
export const worker = new Worker(
  'componentQueue',
  async (job: Job<Component>) => {
    const { id, url } = job.data;

    console.log(`Pinging component: ${url}`);
    try {
      const response = await axios.get(url, { timeout: 5000 });
      const status = deriveStatusFromHttp(response.status);
      console.log(`Component ${id} is ${status}`);

      // Schedule the next ping after 1 hour using Bull's delay instead of setTimeout
      await addComponentToQueue({ id, url }, 3600000); // 1 hour delay

      return { id, status };
    } catch (error: unknown) {
      console.error(`Error pinging ${url}:`, error instanceof Error ? error.message : error);

      const status = deriveStatusFromHttp(0);

      // Schedule the next ping after 1 hour even on failure
      await addComponentToQueue({ id, url }, 3600000);

      return { id, status };
    }
  },
  { connection }
);
