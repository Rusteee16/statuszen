// userTeamRouter.ts
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { users, teams, teamMembers } from "~/server/db/schema";
import { currentUser } from "@clerk/nextjs/server";

export const userTeamRouter = createTRPCRouter({
  createUser: publicProcedure
    .input(z.object({ clerkUserId: z.string(), email: z.string().email(), name: z.string().optional(), role: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(users).values({
        clerkUserId: input.clerkUserId,
        email: input.email,
        name: input.name,
        role: input.role ?? "Member",
      });
    }),

  getAllUsers: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(users);
  }),

  getCurrentUser: protectedProcedure.query(async () => {
    const user = await currentUser();
    return user;
  }),

  createTeam: publicProcedure
    .input(z.object({ name: z.string(), organizationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(teams).values({
        name: input.name,
        organizationId: input.organizationId,
      });
    }),

  getAllTeams: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(teams);
  }),

  addTeamMember: publicProcedure
    .input(z.object({ teamId: z.number(), userId: z.number(), role: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(teamMembers).values({
        teamId: input.teamId,
        userId: input.userId,
        role: input.role ?? "Member",
      });
    }),

  getAllTeamMembers: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(teamMembers);
  }),
});