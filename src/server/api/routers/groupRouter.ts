import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { groups } from "~/server/db/schema";

export const groupRouter = createTRPCRouter({
  createGroup: protectedProcedure
    .input(
      z.object({
        orgId: z.string().uuid(),
        name: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db
        .insert(groups)
        .values(input)
        .returning();
      return result;
    }),

  getGroupsByOrg: protectedProcedure
    .input(z.object({ orgId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const result = await ctx.db
        .select()
        .from(groups)
        .where(eq(groups.orgId, input.orgId));
      return result;
    }),

  removeGroup: protectedProcedure
    .input(z.object({ groupId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db
        .delete(groups)
        .where(eq(groups.id, input.groupId))
        .returning();
      return result;
    }),
});
