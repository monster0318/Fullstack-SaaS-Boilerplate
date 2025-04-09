import WebSocket from "ws"
import { FastifyInstance } from "fastify"
import { auth } from "../lib/auth"
import { fromNodeHeaders } from "better-auth/node"
import { db } from "../context"
import { exampleTable, messageTable, userTable } from "@fsb/drizzle"

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
      const messageString = message.toString()
      console.log(`Received message: ${messageString}`)
      // console.log("messageTable", messageTable)
      // console.log("exampleTable", exampleTable)
      await db.insert(messageTable).values({
        message: messageString,
        senderId: data.user.id,
      })
      // Broadcast message to all other connected clients
      fastify.websocketServer.clients.forEach((client: WebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageString)
        }
      })
    })

    connection.on("close", () => {
      console.log("Client disconnected")
    })

    connection.send("hi from server")
    console.log("Client connected")
  }
}
