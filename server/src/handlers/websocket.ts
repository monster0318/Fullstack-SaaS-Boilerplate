import WebSocket from "ws"
import { FastifyInstance } from "fastify"
import { auth } from "../lib/auth"
import { fromNodeHeaders } from "better-auth/node"
import { db } from "../context"
import { messageTable, userTable } from "@fsb/drizzle"

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

export const websocketHandler = (fastify: FastifyInstance) => {
  return async (connection: WebSocket, req: any) => {
    // console.log("req 546568712", req)

    const headers = fromNodeHeaders(req.headers)
    const data = await auth.api.getSession({
      headers, //some endpoint might require headers
    })
    if (!data) {
      connection.close()
      return
    }

    console.log("data 782789324", data)

    connection.on("message", async (message: Buffer) => {
      try {
        const event: ChatEvent = JSON.parse(message.toString())

        if (event.type === "message") {
          // Store the message in the database
          await db.insert(messageTable).values({
            message: event.message.content,
            senderId: data.user.id,
          })

          // Add sender information to the message
          const messageWithSender: ChatMessage = {
            ...event.message,
            senderId: data.user.id,
          }

          // Broadcast to all clients
          const broadcastEvent: ChatEvent = {
            type: "message",
            message: messageWithSender,
          }

          fastify.websocketServer.clients.forEach((client: WebSocket) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(broadcastEvent))
            }
          })
        }
      } catch (error) {
        console.error("Error handling message:", error)
        const errorEvent: ChatEvent = {
          type: "error",
          message: {
            type: "error",
            content: "Error processing message",
            timestamp: Date.now(),
          },
        }
        connection.send(JSON.stringify(errorEvent))
      }
    })

    connection.on("close", () => {
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
    connection.send(JSON.stringify(welcomeEvent))

    console.log("Client connected")
  }
}
