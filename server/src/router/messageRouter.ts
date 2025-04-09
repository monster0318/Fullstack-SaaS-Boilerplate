import { protectedProcedure, router } from "../trpc"
import { z } from "zod"
import { messageTable } from "@fsb/drizzle"
import { db } from "../context"
import { broadcastMessage } from "../lib/sse"

const messageRouter = router({
  sendMessage: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Store the message in the database
      await db.insert(messageTable).values({
        message: input.message,
        senderId: ctx.user.id,
      })

      await broadcastMessage(input.message, ctx.user.id)
      return { success: true }
    }),
})

export default messageRouter
