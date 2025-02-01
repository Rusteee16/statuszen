// src/server/api/routers/userRouter.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { eq } from "drizzle-orm";
import { incidents, publicComponents, statusHistory, users } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  createUser: protectedProcedure
    .input(z.object({
      orgId: z.string().uuid(),
      fname: z.string(),
      lname: z.string(),
      email: z.string().email(),
      clerkId: z.string(),
      role: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.insert(users).values(input);
    }),

  getUsersByOrg: protectedProcedure
    .input(z.object({ orgId: z.string().uuid() }))
    .query(({ input, ctx }) => {
      return ctx.db.select().from(users).where(eq(users.orgId, input.orgId));
    }),

  removeUserFromOrg: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.delete(users).where(eq(users.id, input.userId));
    }),

  changeUserRole: protectedProcedure
    .input(z.object({ userId: z.string().uuid(), role: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
    }),
});

// src/server/api/routers/organizationRouter.ts
import { organizations } from "~/server/db/schema";

export const organizationRouter = createTRPCRouter({
  createOrganization: protectedProcedure
    .input(z.object({ name: z.string(), ownerId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.insert(organizations).values(input);
    }),

  getOrganization: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ input, ctx }) => {
      return ctx.db.select().from(organizations).where(eq(organizations.id, input.id));
    }),
});

// src/server/api/routers/groupRouter.ts
import { groups } from "~/server/db/schema";

export const groupRouter = createTRPCRouter({
  createGroup: protectedProcedure
    .input(z.object({
      orgId: z.string().uuid(),
      name: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.insert(groups).values(input);
    }),

  getGroupsByOrg: protectedProcedure
    .input(z.object({ orgId: z.string().uuid() }))
    .query(({ input, ctx }) => {
      return ctx.db.select().from(groups).where(eq(groups.orgId, input.orgId));
    }),

  removeGroup: protectedProcedure
    .input(z.object({ groupId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.delete(groups).where(eq(groups.id, input.groupId));
    }),
});

// src/server/api/routers/componentRouter.ts
import { components } from "~/server/db/schema";

export const componentRouter = createTRPCRouter({
  createComponent: protectedProcedure
    .input(z.object({
      groupId: z.string().uuid(),
      orgId: z.string().uuid(),
      name: z.string(),
      description: z.string().optional(),
      url: z.string().url().optional(),
      status: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.insert(components).values(input);
    }),

  getComponentsByGroup: protectedProcedure
    .input(z.object({ groupId: z.string().uuid() }))
    .query(({ input, ctx }) => {
      return ctx.db.select().from(components).where(eq(components.groupId, input.groupId));
    }),

  getAllComponentsByOrg: protectedProcedure
    .input(z.object({ orgId: z.string().uuid() }))
    .query(({ input, ctx }) => {
      return ctx.db.select().from(components).where(eq(components.orgId, input.orgId));
    }),

  updateComponentStatus: protectedProcedure
    .input(z.object({ componentId: z.string().uuid(), status: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.update(components).set({ status: input.status }).where(eq(components.id, input.componentId));
    }),

  removeComponent: protectedProcedure
    .input(z.object({ componentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.delete(components).where(eq(components.id, input.componentId));
    }),
});


// Status History Router
export const statusHistoryRouter = createTRPCRouter({
  addStatusHistory: protectedProcedure
    .input(z.object({
      componentId: z.string().uuid(),
      status: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.insert(statusHistory).values(input);
    }),

  getStatusHistoryByComponent: protectedProcedure
    .input(z.object({ componentId: z.string().uuid() }))
    .query(({ input, ctx }) => {
      return ctx.db.select().from(statusHistory).where(eq(statusHistory.componentId, input.componentId));
    }),
});

// Incidents Router
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
});

// Public Components Router
export const publicComponentRouter = createTRPCRouter({
  getAllPublicComponents: publicProcedure.query(({ ctx }) => {
    return ctx.db.select().from(publicComponents);
  }),
});
