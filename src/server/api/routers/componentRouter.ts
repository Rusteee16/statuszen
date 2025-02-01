import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { components, groups } from "~/server/db/schema";
import { broadcastStatusUpdate } from "~/server/websockets/statusUpdater";

export const componentRouter = createTRPCRouter({
  createComponent: protectedProcedure
    .input(
      z.object({
        groupId: z.string().uuid(),
        orgId: z.string().uuid(),
        name: z.string(),
        description: z.string().optional(),
        url: z.string().url().optional(),
        status: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db
        .insert(components)
        .values(input)
        .returning();
      return result;
    }),

  getComponentsByGroup: protectedProcedure
    .input(z.object({ groupId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const result = await ctx.db
        .select()
        .from(components)
        .where(eq(components.groupId, input.groupId));
      return result;
    }),

  getAllComponentsByOrg: protectedProcedure
    .input(z.object({ orgId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const result = await ctx.db
        .select()
        .from(components)
        .where(eq(components.orgId, input.orgId));
      return result;
    }),


    updateComponentStatus: protectedProcedure
        .input(z.object({ componentId: z.string().uuid(), status: z.string() }))
        .mutation(async ({ input, ctx }) => {
        const updatedComponent = await ctx.db.update(components)
            .set({ status: input.status })
            .where(eq(components.id, input.componentId));
    
        broadcastStatusUpdate(input.componentId, input.status);
    
        return updatedComponent;
    }),

  removeComponent: protectedProcedure
    .input(z.object({ componentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db
        .delete(components)
        .where(eq(components.id, input.componentId))
        .returning();
      return result;
    }),
});
