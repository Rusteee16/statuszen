import { userTeamRouter } from "~/server/api/routers/userTeam";
import { organizationServiceRouter } from "~/server/api/routers/organizationService";
import { incidentStatusRouter } from "~/server/api/routers/incidentStatus";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  userTeam: userTeamRouter,
  organizationService: organizationServiceRouter,
  incidentStatus: incidentStatusRouter,
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
