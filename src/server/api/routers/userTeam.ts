// userTeamRouter.ts
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { users, teams, organizations } from "~/server/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";

export const userTeamRouter = createTRPCRouter({
  createUser: publicProcedure
    .input(z.object({
      clerkUserId: z.string(),
      email: z.string().email(),
      name: z.string().optional(),
      role: z.string().optional(),
      organizationId: z.number(), 
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(users).values({
        clerkUserId: input.clerkUserId,
        email: input.email,
        name: input.name,
        role: input.role ?? "Member",
        organizationId: input.organizationId, 
      });
    }),


  getAllUsers: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(users);
  }),

  getCurrentUser: protectedProcedure.query(async () => {
    const user = await currentUser();
    return user;
  }),

  getUserOrganization: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(organizations)
        .innerJoin(users, sql`${organizations.id} = ${users.organizationId}`)
        .where(sql`${users.id} = ${input.userId}`)
        .limit(1);
    }),
});