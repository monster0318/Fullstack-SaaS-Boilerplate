import { FastifyRequest, FastifyReply } from "fastify"
import { activeConnections, sendEvent, ChatEvent } from "../lib/sse"

// Constants
const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
  "Access-Control-Allow-Origin": process.env.CLIENT_URL,
  "Access-Control-Allow-Credentials": "true",
} as const

// Types
type ErrorResponse = {
  type: "error"
  message: {
    type: "error"
    content: string
    timestamp: number
  }
}

// Helper functions
const sendErrorResponse = (reply: FastifyReply, status: number, message: string) => {
  const errorResponse: ErrorResponse = {
    type: "error",
    message: {
      type: "error",
      content: message,
      timestamp: Date.now(),
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
