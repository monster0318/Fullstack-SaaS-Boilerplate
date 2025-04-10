import { FastifyReply } from "fastify"

export interface ChatMessage {
  type: "text" | "system" | "error"
  message: string
  createdAt: Date
  // senderId?: string
}

export interface ChatEvent {
  type: "message" | "connection" | "error"
  message: ChatMessage
}

// Store active SSE connections
export const activeConnections = new Set<FastifyReply>()

// Helper function to send SSE events
export const sendEvent = (reply: FastifyReply, event: ChatEvent) => {
  console.log("Sending event:", event)
  try {
    reply.raw.write(`data: ${JSON.stringify(event)}\n\n`)
  } catch (error) {
    console.error("Error sending event:", error)
  }
}

// Function to broadcast messages to all connected clients
export const broadcastMessage = async (message: string, senderId: string) => {
  try {
    const chatEvent: ChatEvent = {
      type: "message",
      message: {
        type: "text",
        message,
        createdAt: new Date(),
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
