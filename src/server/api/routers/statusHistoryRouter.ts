import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { statusHistory } from "~/server/db/schema";

export const statusHistoryRouter = createTRPCRouter({
  addStatusHistory: protectedProcedure
    .input(
      z.object({
        componentId: z.string().uuid(),
        status: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db
        .insert(statusHistory)
        .values(input)
        .returning();
      return result;
    }),

  getStatusHistoryByComponent: protectedProcedure
    .input(z.object({ componentId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const result = await ctx.db
        .select()
        .from(statusHistory)
        .where(eq(statusHistory.componentId, input.componentId));
      return result;
    }),
});
