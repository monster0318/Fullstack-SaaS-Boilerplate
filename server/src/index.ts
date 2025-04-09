import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify"
import Fastify, { FastifyRequest, FastifyReply } from "fastify"
import fastifyCookie from "@fastify/cookie"
import fastifyCors from "@fastify/cors"
import fastifyWebsocket from "@fastify/websocket"
import WebSocket from "ws"

// import t from "./trpc"
import { authHandler } from "./handlers/auth"
import { websocketHandler } from "./handlers/websocket"
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
      handler: authHandler,
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
    fastify.get("/ws", { websocket: true }, websocketHandler(fastify))

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
