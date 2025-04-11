import { FastifyRequest, FastifyReply } from "fastify"
import { userTable } from "@fsb/drizzle"

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
  "Access-Control-Allow-Origin": process.env.CLIENT_URL,
  "Access-Control-Allow-Credentials": "true",
} as const

type User = typeof userTable.$inferSelect
type Sender = Pick<User, "id" | "name" | "image">
interface ChatMessage {
  // type: "text" | "system" | "error"
  message: string
  createdAt: Date
  sender?: Sender
  // senderId?: string
}

interface ChatEvent {
  type: "message" | "connection" | "error"
  message: ChatMessage
}

// Store active SSE connections
const activeConnections = new Set<FastifyReply>()

// Helper function to send SSE events
const sendEvent = (reply: FastifyReply, event: ChatEvent) => {
  console.log("Sending event:", event)
  try {
    reply.raw.write(`data: ${JSON.stringify(event)}\n\n`)
  } catch (error) {
    console.error("Error sending event:", error)
  }
}

// Function to broadcast messages to all connected clients
export const broadcastMessage = async (message: string, sender: Sender) => {
  try {
    const chatEvent: ChatEvent = {
      type: "message",
      message: {
        // type: "text",
        message,
        createdAt: new Date(),
        sender,
        // senderId,
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

// Helper functions
const sendErrorResponse = (reply: FastifyReply, status: number, message: string) => {
  const errorResponse: ChatEvent = {
    type: "error",
    message: {
      message: message,
      createdAt: new Date(),
    },
  }

  reply.raw.writeHead(status, SSE_HEADERS)
  reply.raw.write(`data: ${JSON.stringify(errorResponse)}\n\n`)
  reply.raw.end()
}

const setupConnection = (reply: FastifyReply) => {
  reply.raw.writeHead(200, SSE_HEADERS)
  activeConnections.add(reply)
}

const sendWelcomeMessage = (reply: FastifyReply) => {
  const welcomeEvent: ChatEvent = {
    type: "connection",
    message: {
      message: "Connected successfully",
      createdAt: new Date(),
    },
  }
  sendEvent(reply, welcomeEvent)
}

export const sseHandler = () => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      setupConnection(reply)

      // Handle client disconnect
      request.raw.on("close", () => {
        activeConnections.delete(reply)
        console.log("Client disconnected")
      })

      sendWelcomeMessage(reply)
      console.log("Client connected successfully")
    } catch (error) {
      console.error("Error in SSE handler:", error)
      sendErrorResponse(reply, 500, "Internal server error")
    }
  }
}
