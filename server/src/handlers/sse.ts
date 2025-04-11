import { FastifyRequest, FastifyReply } from "fastify"
import { userTable } from "@fsb/drizzle"

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
  "Access-Control-Allow-Origin": process.env.CLIENT_URL,
  "Access-Control-Allow-Credentials": "true",
}

type User = typeof userTable.$inferSelect
type Sender = Pick<User, "id" | "name" | "image">

interface ChatMessage {
  message: string
  createdAt: Date
  sender?: Sender
}

interface ChatEvent {
  type: "message" | "connection" | "error"
  message: ChatMessage
}

// Store active SSE connections
const activeConnections = new Set<FastifyReply>()

// Function to broadcast messages to all connected clients
export const broadcastMessage = async (message: string, sender: Sender) => {
  try {
    const chatEvent: ChatEvent = {
      type: "message",
      message: {
        message,
        createdAt: new Date(),
        sender,
      },
    }

    // Broadcast to all connected clients
    activeConnections.forEach((client) => {
      client.raw.write(getWriteStringSSE(chatEvent))
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
  reply.raw.write(getWriteStringSSE(errorResponse))
  reply.raw.end()
}

const setupConnection = (reply: FastifyReply) => {
  reply.raw.writeHead(200, SSE_HEADERS)
  activeConnections.add(reply)
}

const getWriteStringSSE = (event: ChatEvent) => {
  return `data: ${JSON.stringify(event)}\n\n`
}

const sendWelcomeMessage = (reply: FastifyReply) => {
  const welcomeEvent: ChatEvent = {
    type: "connection",
    message: {
      message: "Connected successfully",
      createdAt: new Date(),
    },
  }
  reply.raw.write(getWriteStringSSE(welcomeEvent))
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
