// incidentStatusRouter.ts
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { incidents, incidentUpdates, statusHistory } from "~/server/db/schema";

export const incidentStatusRouter = createTRPCRouter({
  createIncident: publicProcedure
    .input(z.object({ title: z.string(), description: z.string().optional(), status: z.string().optional(), impact: z.string().optional(), serviceId: z.number(), createdBy: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(incidents).values({
        title: input.title,
        description: input.description,
        status: input.status,
        impact: input.impact,
        serviceId: input.serviceId,
        createdBy: input.createdBy,
      });
    }),

  getAllIncidents: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(incidents);
  }),

  createIncidentUpdate: publicProcedure
    .input(z.object({ incidentId: z.number(), message: z.string(), status: z.string().optional(), createdBy: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(incidentUpdates).values({
        incidentId: input.incidentId,
        message: input.message,
        status: input.status,
        createdBy: input.createdBy,
      });
    }),

  getAllIncidentUpdates: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(incidentUpdates);
  }),

  createStatusHistory: publicProcedure
    .input(z.object({ serviceId: z.number(), previousStatus: z.string().optional(), currentStatus: z.string(), changedBy: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(statusHistory).values({
        serviceId: input.serviceId,
        previousStatus: input.previousStatus,
        currentStatus: input.currentStatus,
        changedBy: input.changedBy,
      });
    }),

  getAllStatusHistory: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(statusHistory);
  }),
});