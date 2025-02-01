import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  /**
   * Create a new user.
   * Every user must have an organization, first name, last name, email, clerkId, and role.
   */
  createUser: protectedProcedure
    .input(
      z.object({
        orgId: z.string().uuid(),
        fname: z.string().min(1, "First name is required"),
        lname: z.string().min(1, "Last name is required"),
        email: z.string().email("A valid email is required"),
        clerkId: z.string().min(1, "Clerk id is required"),
        role: z.string().min(1, "Role is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const newUser = await ctx.db
        .insert(users)
        .values(input)
        .returning();
      return newUser;
    }),

  /**
   * Retrieve all users belonging to a specific organization.
   */
  getUsersByOrg: protectedProcedure
    .input(z.object({ orgId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const usersList = await ctx.db
        .select()
        .from(users)
        .where(eq(users.orgId, input.orgId));
      return usersList;
    }),

  /**
   * Retrieve a single user by their unique id.
   */
  getUserById: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const userRecord = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, input.userId));
      return userRecord;
    }),

  /**
   * Change the role of a user.
   */
  changeUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        role: z.string().min(1, "Role is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const updatedUser = await ctx.db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId))
        .returning();
      return updatedUser;
    }),

  /**
   * Update user details.
   * Only the provided fields will be updated.
   */
  updateUser: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        fname: z.string().optional(),
        lname: z.string().optional(),
        email: z.string().email("Must be a valid email").optional(),
        clerkId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, ...updateData } = input;
      const updatedUser = await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();
      return updatedUser;
    }),

  /**
   * Delete a user.
   */
  deleteUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const deletedUser = await ctx.db
        .delete(users)
        .where(eq(users.id, input.userId))
        .returning();
      return deletedUser;
    }),
});
