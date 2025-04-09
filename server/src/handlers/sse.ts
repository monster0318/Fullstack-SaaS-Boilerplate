import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"
import { auth } from "../lib/auth"
import { fromNodeHeaders } from "better-auth/node"
import { db } from "../context"
import { messageTable } from "@fsb/drizzle"
import { z } from "zod"

interface ChatMessage {
  type: "text" | "system" | "error"
  content: string
  timestamp: number
  senderId?: string
}

interface ChatEvent {
  type: "message" | "connection" | "error"
  message: ChatMessage
}

// Store active SSE connections
const activeConnections = new Set<FastifyReply>()

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
          type: "system",
          content: "Welcome to the chat!",
          timestamp: Date.now(),
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

// Helper function to send SSE events
export const sendEvent = (reply: FastifyReply, event: ChatEvent) => {
  try {
    reply.raw.write(`data: ${JSON.stringify(event)}\n\n`)
  } catch (error) {
    console.error("Error sending event:", error)
  }
}

// Function to broadcast messages to all connected clients
export const broadcastMessage = async (message: string, senderId: string) => {
  try {
    // Store the message in the database
    await db.insert(messageTable).values({
      message,
      senderId,
    })

    const chatEvent: ChatEvent = {
      type: "message",
      message: {
        type: "text",
        content: message,
        timestamp: Date.now(),
        senderId,
      },
    }

    // Broadcast to all connected clients
    activeConnections.forEach((client) => {
      sendEvent(client, chatEvent)
    })
  } catch (error) {
    console.error("Error broadcasting message:", error)
  }
}

// Message sending endpoint
export const messageHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const headers = fromNodeHeaders(request.headers)
    const data = await auth.api.getSession({
      headers,
    })

    if (!data) {
      console.log("Authentication failed in message handler")
      return reply.status(401).send({ error: "Unauthorized" })
    }

    const { message } = z
      .object({
        message: z.string().min(1),
      })
      .parse(request.body)

    await broadcastMessage(message, data.user.id)

    return reply.status(200).send({ success: true })
  } catch (error) {
    console.error("Error in message handler:", error)
    return reply.status(500).send({ error: "Failed to send message" })
  }
}
