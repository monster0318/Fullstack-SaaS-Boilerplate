import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify"
import Fastify, { FastifyRequest, FastifyReply } from "fastify"
import fastifyCookie from "@fastify/cookie"
import fastifyCors from "@fastify/cors"
import fastifyWebsocket from "@fastify/websocket"
import WebSocket from "ws"

// import t from "./trpc"
import { auth } from "./lib/auth"
import dotenv from "dotenv"
dotenv.config({ path: "../server.env" })
import createContext from "./context"
import { AppRouter, appRouter } from "./router"

// export const mergeRouters = t.mergeRouters

const fastify = Fastify({
  maxParamLength: 5000,
  // logger: true,
})

const start = async () => {
  try {
    await fastify.register(fastifyCors, {
      credentials: true,
      origin: process.env.CLIENT_URL,
    })

    await fastify.register(fastifyCookie)
    await fastify.register(fastifyWebsocket)

    // https://github.com/better-auth/better-auth/pull/2006
    // Register authentication endpoint
    fastify.route({
      method: ["GET", "POST"],
      url: "/api/auth/*",
      async handler(request, reply) {
        try {
          // Construct request URL
          const url = new URL(request.url, `http://${request.headers.host}`)

          // Convert Fastify headers to standard Headers object
          const headers = new Headers()
          Object.entries(request.headers).forEach(([key, value]) => {
            if (value) headers.append(key, value.toString())
          })

          // Create Fetch API-compatible request
          const req = new Request(url.toString(), {
            method: request.method,
            headers,
            body: request.body ? JSON.stringify(request.body) : undefined,
          })

          // Process authentication request
          const response = await auth.handler(req)

          // Forward response to client
          reply.status(response.status)
          response.headers.forEach((value, key) => reply.header(key, value))
          reply.send(response.body ? await response.text() : null)
        } catch (error) {
          fastify.log.error("Authentication Error:", error)
          reply.status(500).send({
            error: "Internal authentication error",
            code: "AUTH_FAILURE",
          })
        }
      },
    })

    fastify.get("/", async (_request: FastifyRequest, reply: FastifyReply) => {
      return reply.send({ message: "Hello, TER!" })
    })

    await fastify.register(fastifyTRPCPlugin, {
      prefix: "/",
      trpcOptions: {
        router: appRouter,
        createContext,
      } as FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
    })

    // Websocket route for chat
    fastify.get("/ws", { websocket: true }, (connection /* Inferred Type */, req /* FastifyRequest */) => {
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
    })

    const port = Number(process.env.PORT) || 2022
    await fastify.listen({
      port,
      host: "0.0.0.0",
    })
    console.log("Server is running on port " + port)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
