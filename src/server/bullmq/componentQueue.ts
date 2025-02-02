// src/server/bullmq/queue.ts
import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import axios from 'axios';

const connection = new IORedis();

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

// Function to add components to the queue
export const addComponentToQueue = async (component: Component): Promise<void> => {
  await componentQueue.add('pingComponent', component);
};

// Worker to process components
export const worker = new Worker('componentQueue', async (job: Job<Component>) => {
  const { id, url } = job.data;

  console.log(`Pinging component: ${url}`);
  try {
    const response = await axios.get(url, { timeout: 5000 });
    const status = deriveStatusFromHttp(response.status);
    console.log(`Component ${id} is ${status}`);

    // Add the component back to the queue
    await addComponentToQueue({ id, url });

    return { id, status };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error pinging ${url}:`, error.message);
    } else {
      console.error(`Unknown error pinging ${url}`);
    }

    const status = deriveStatusFromHttp(0);

    // Add the component back to the queue
    await addComponentToQueue({ id, url });

    return { id, status };
  }
}, { connection });
