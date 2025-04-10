import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"
import { auth } from "../lib/auth"
import { fromNodeHeaders } from "better-auth/node"
import { activeConnections, sendEvent, ChatEvent } from "../lib/sse"

export const sseHandler = (fastify: FastifyInstance) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Authenticate the user
      const headers = fromNodeHeaders(request.headers)
      const data = await auth.api.getSession({
        headers,
      })

      if (!data) {
        console.log("Authentication failed - no session data")
        reply.raw.writeHead(401, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        })
        reply.raw.write(
          `data: ${JSON.stringify({
            type: "error",
            message: {
              type: "error",
              content: "Authentication failed",
              timestamp: Date.now(),
            },
          })}\n\n`
        )
        reply.raw.end()
        return
      }

      console.log("User authenticated:", data.user.id)

      // Set SSE headers
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": process.env.CLIENT_URL || "http://localhost:3000",
        "Access-Control-Allow-Credentials": "true",
      })

      // Add this connection to active connections
      activeConnections.add(reply)

      // Handle client disconnect
      request.raw.on("close", () => {
        activeConnections.delete(reply)
        console.log("Client disconnected")
      })

      // Send welcome message
      const welcomeEvent: ChatEvent = {
        type: "connection",
        message: {
          // type: "system",
          message: "Welcome to the chat!",
          createdAt: new Date(),
        },
      }
      sendEvent(reply, welcomeEvent)

      console.log("Client connected successfully")
    } catch (error) {
      console.error("Error in SSE handler:", error)
      reply.raw.writeHead(500, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      })
      reply.raw.write(
        `data: ${JSON.stringify({
          type: "error",
          message: {
            type: "error",
            content: "Internal server error",
            timestamp: Date.now(),
          },
        })}\n\n`
      )
      reply.raw.end()
    }
  }
}
