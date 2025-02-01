// organizationServiceRouter.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { organizations, services } from "~/server/db/schema";

export const organizationServiceRouter = createTRPCRouter({
  createOrganization: publicProcedure
    .input(z.object({ name: z.string(), slug: z.string(), ownerId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(organizations).values({
        name: input.name,
        slug: input.slug,
        ownerId: input.ownerId,
      });
    }),

  getAllOrganizations: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(organizations);
  }),

  createService: publicProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      status: z.string().optional(),
      organizationId: z.number(),
      url: z.string().url(),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(services).values({
        name: input.name,
        description: input.description,
        status: input.status ?? "Operational",
        organizationId: input.organizationId,
        url: input.url,
        isPublic: input.isPublic,
      });
    }),

  getAllServices: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(services);
  }),
});