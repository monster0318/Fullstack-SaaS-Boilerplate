import { publicProcedure, router } from "../trpc"

const healthRouter = router({
  trpc: publicProcedure.query(() => {
    return { message: "ok" }
  }),
})
export default healthRouter
