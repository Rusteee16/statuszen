import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { components, groups } from "~/server/db/schema";

// Import our BullMQ queue
import { addComponentToQueue, componentQueue } from "~/server/bullmq/componentQueue";

export const componentRouter = createTRPCRouter({

  createComponent: protectedProcedure
    .input(z.object({
      groupId: z.string().uuid(),
      orgId: z.string().uuid(),
      name: z.string(),
      description: z.string().optional(),
      url: z.string().url(),
      status: z.enum(["OPERATIONAL", "PERFORMANCE_ISSUES", "PARTIAL_OUTAGE", "MAJOR_OUTAGE", "UNKNOWN"])
    }))
    .mutation(async ({ input, ctx }) => {
      const newComponent = await ctx.db.insert(components).values(input).returning();

      // Add the newly created component to the queue
      if (newComponent[0]) {
        await addComponentToQueue({ id: newComponent[0].id, url: input.url });
      }

      return newComponent;
    }),


  // 3) Get all components for a group
  getComponentsByGroup: protectedProcedure
    .input(z.object({ groupId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      return await ctx.db
        .select()
        .from(components)
        .where(eq(components.groupId, input.groupId));
    }),

  // 4) Get all components for an org
  getAllComponentsByOrg: protectedProcedure
    .input(z.object({ orgId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      return await ctx.db
        .select()
        .from(components)
        .where(eq(components.orgId, input.orgId));
    }),

  // 5) Update component status manually
  updateComponentStatus: protectedProcedure
    .input(z.object({
      componentId: z.string().uuid(),
      status: z.enum(["OPERATIONAL", "PERFORMANCE_ISSUES", "PARTIAL_OUTAGE", "MAJOR_OUTAGE", "UNKNOWN"])
    }))
    .mutation(async ({ input, ctx }) => {
      const updatedComponent = await ctx.db.update(components)
        .set({ status: input.status })
        .where(eq(components.id, input.componentId));

      return updatedComponent;
    }),

  // 6) Remove a component
  deleteComponent: protectedProcedure
    .input(z.object({ componentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      // Remove the component from the queue
      const jobs = await componentQueue.getJobs(['waiting', 'active', 'delayed']);
      const jobToRemove = jobs.find(job => job.data.id === input.componentId);

      if (jobToRemove) {
        await jobToRemove.remove();
        console.log(`Removed component ${input.componentId} from the queue.`);
      }

      // Delete the component from the database
      const deletedComponent = await ctx.db.delete(components)
        .where(eq(components.id, input.componentId));

      return deletedComponent;
    }),
});
