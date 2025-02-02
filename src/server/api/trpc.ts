/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { componentQueue, worker, addComponentToQueue } from "~/server/bullmq/componentQueue";

import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "~/server/db";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  // Initialize the queue with default components if it's empty
  const jobCounts = await componentQueue.getJobCounts();
  
  if (jobCounts.waiting === 0 && jobCounts.active === 0) {
    console.log("Initializing BullMQ Queue...");

    const defaultComponents = [
      { id: "1", url: "https://api.github.com" },                      // GitHub API status
      { id: "2", url: "https://jsonplaceholder.typicode.com/posts" }, // Fake API for testing
      { id: "3", url: "https://api.openweathermap.org/data/2.5/weather?q=London&appid=demo" }, // OpenWeatherMap API
      { id: "4", url: "https://httpstat.us/200" },                    // Returns HTTP 200 OK
      { id: "5", url: "https://httpstat.us/503" },                    // Returns HTTP 503 Service Unavailable
      { id: "6", url: "https://pokeapi.co/api/v2/pokemon/ditto" },    // PokeAPI example
      { id: "7", url: "https://reqres.in/api/users/2" },              // Reqres API for testing
      { id: "8", url: "https://api.spacexdata.com/v4/launches/latest" }, // SpaceX API for latest launches
      { id: "9", url: "https://api.coinbase.com/v2/prices/BTC-USD/spot" }, // Coinbase API for Bitcoin price
      { id: "10", url: "https://api.agify.io?name=michael" }           // Predicts age based on name
    ];
    

    for (const component of defaultComponents) {
      await addComponentToQueue(component);
      console.log(`Added component ${component.id} to the queue.`);
    }
  }

  return {
    db,
    ...opts,
  };
};


/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  const { userId } = await auth();
  if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

  return next({
    ctx: {
      ...ctx,
      userId,
    },
  });
});


export const protectedProcedure = t.procedure.use(isAuthenticated);

