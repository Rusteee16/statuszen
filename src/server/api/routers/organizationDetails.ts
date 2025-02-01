import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { organizations, services, teams } from "~/server/db/schema";
import { sql } from "drizzle-orm";

export const organizationDetailsRouter = createTRPCRouter({
  // Fetch all organizations for a user
  getOrganizationForUser: protectedProcedure
  .input(z.object({ userId: z.number() }))
  .query(async ({ ctx, input }) => {
    return await ctx.db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
      })
      .from(organizations)
      .innerJoin(users, sql`${organizations.id} = ${users.organizationId}`)
      .where(sql`${users.id} = ${input.userId}`)
      .limit(1); // Only one organization per user
  });



  // Fetch organization details
  getOrganizationDetails: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(organizations)
        .where(sql`${organizations.id} = ${input.organizationId}`)
        .limit(1);
    }),

  // Fetch services for an organization
  getOrganizationServices: protectedProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(services)
        .where(sql`${services.organizationId} = ${input.organizationId}`);
    }),
});
