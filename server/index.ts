import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from "@trpc/server/adapters/fastify"
import Fastify, { FastifyRequest, FastifyReply } from "fastify"
import fastifyCookie from "@fastify/cookie"
import fastifyCors from "@fastify/cors"
import jwt from "jsonwebtoken"
import authRouter from "./router/authRouter"
import userRouter from "./router/userRouter"
import deviceRouter from "./router/deviceRouter"
import healthRouter from "./router/healthRouter"
import beerRouter from "./router/beerRouter"
import t from "./trpc"
import { toNodeHandler } from "better-auth/node"
import { auth } from "./lib/auth"
import dotenv from "dotenv"
dotenv.config({ path: "../server.env" })
import createContext from "./context"

export interface UserIDJwtPayload extends jwt.JwtPayload {
  id: string
  exp: number
  iat: number
}

export const mergeRouters = t.mergeRouters

const appRouter = mergeRouters(authRouter, userRouter, deviceRouter, healthRouter, beerRouter)
export type AppRouter = typeof appRouter

const fastify = Fastify({
  maxParamLength: 5000,
  logger: true,
})

const start = async () => {
  try {
    await fastify.register(fastifyCors, {
      credentials: true,
      origin: process.env.CLIENT_URL,
    })

    await fastify.register(fastifyCookie)

    // Add auth handler for all routes under /api/auth
    // fastify.all("/api/auth/*", async (request, reply) => {
    //   console.log("auth handler")
    //   const data = await toNodeHandler(auth)
    //   console.log(data)
    // })
    await fastify.register((fastify) => {
      const authhandler = toNodeHandler(auth)

      fastify.addContentTypeParser("application/json", (_request, _payload, done) => {
        done(null, null)
      })

      fastify.all("/api/auth/*", async (request, reply) => {
        console.log("auth handler")
        await authhandler(request.raw, reply.raw)
      })
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
