import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { publicComponents } from "~/server/db/schema";

export const publicComponentRouter = createTRPCRouter({
  getAllPublicComponents: publicProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.select().from(publicComponents);
    return result;
  }),
});
