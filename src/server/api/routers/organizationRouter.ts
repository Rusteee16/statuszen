import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { organizations } from "~/server/db/schema";

export const organizationRouter = createTRPCRouter({
  createOrganization: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db
        .insert(organizations)
        .values(input)
        .returning();
      return result;
    }),

  getOrganization: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const result = await ctx.db
        .select()
        .from(organizations)
        .where(eq(organizations.id, input.id));
      return result;
    }),
});
