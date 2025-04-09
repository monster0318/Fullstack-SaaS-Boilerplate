import WebSocket from "ws"
import { FastifyInstance } from "fastify"

export const websocketHandler = (fastify: FastifyInstance) => {
  return (connection: WebSocket, req: any) => {
    connection.on("message", (message: Buffer) => {
      const messageString = message.toString()
      console.log(`Received message: ${messageString}`)
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
