import { protectedProcedure, publicProcedure, router } from "../trpc"
import { z } from "zod"
import { messageTable, drizzleOrm } from "@fsb/drizzle"

import { broadcastMessage } from "../lib/sse"
const { desc, lt } = drizzleOrm

const messageRouter = router({
  sendMessage: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(messageTable).values({
        message: input.message,
        senderId: ctx.user.id,
      })

      await broadcastMessage(input.message, {
        id: ctx.user.id,
        name: ctx.user.name,
        image: ctx.user.image,
      })
      return { success: true }
    }),
  getMessages: publicProcedure
    .input(
      z.object({
        before: z.string().datetime().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const messages = await ctx.db.query.messageTable.findMany({
        where: input.before ? lt(messageTable.createdAt, new Date(input.before)) : undefined,
        orderBy: [desc(messageTable.createdAt)],
        limit: 20,
        with: {
          sender: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      })
      return messages
    }),
})

export default messageRouter
