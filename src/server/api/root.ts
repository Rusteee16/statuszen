import { componentRouter } from "./routers/componentRouter";
import { groupRouter } from "./routers/groupRouter";
import { incidentRouter } from "./routers/incidentRouter";
import { organizationRouter } from "./routers/organizationRouter";
import { statusHistoryRouter } from "./routers/statusHistoryRouter";
import { userRouter } from "./routers/userRouter";
import { createTRPCRouter, createCallerFactory } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  componentRouter: componentRouter,
  groupRouter: groupRouter,
  incidentRouter: incidentRouter,
  organizationRouter: organizationRouter,
  statusHistoryRouter: statusHistoryRouter, 
  userRouter: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
