import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { eq, and, inArray } from "drizzle-orm";
import { incidents, components } from "~/server/db/schema";

export const incidentRouter = createTRPCRouter({
  createIncident: protectedProcedure
    .input(z.object({
      componentId: z.string().uuid(),
      title: z.string(),
      description: z.string().optional(),
      status: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.insert(incidents).values(input);
    }),

  getIncidentsByComponent: protectedProcedure
    .input(z.object({ componentId: z.string().uuid() }))
    .query(({ input, ctx }) => {
      return ctx.db.select().from(incidents).where(eq(incidents.componentId, input.componentId));
    }),

  getAllIncidentsByOrg: protectedProcedure
    .input(z.object({ orgId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const componentsInOrg = await ctx.db.select({ id: components.id })
        .from(components)
        .where(eq(components.orgId, input.orgId));

      const componentIds = componentsInOrg.map(c => c.id);

      return ctx.db.select().from(incidents).where(inArray(incidents.componentId, componentIds));
    }),
});