import { protectedProcedure, publicProcedure, router } from "../trpc"
import { z } from "zod"
import { messageTable, drizzleOrm } from "@fsb/drizzle"
// import { db } from "../context"
import { broadcastMessage } from "../lib/sse"
const { desc } = drizzleOrm

const messageRouter = router({
  sendMessage: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Store the message in the database
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
  getMessages: publicProcedure.query(async ({ ctx }) => {
    const messages = await ctx.db.query.messageTable.findMany({
      limit: 50,
      orderBy: [desc(messageTable.createdAt)],
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
