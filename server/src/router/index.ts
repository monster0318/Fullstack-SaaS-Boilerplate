import userRouter from "./userRouter"
import sessionRouter from "./sessionRouter"
import healthRouter from "./healthRouter"
import beerRouter from "./beerRouter"
import messageRouter from "./messageRouter"
import { router } from "../trpc"

export const appRouter = router({
  session: sessionRouter,
  health: healthRouter,
  beer: beerRouter,
  user: userRouter,
  message: messageRouter,
})

export type AppRouter = typeof appRouter
