import { createAuthClient } from "better-auth/react"
const url = import.meta.env.VITE_URL_BACKEND
import { inferAdditionalFields } from "better-auth/client/plugins"
import { auth } from "../../../server/src/lib/auth"

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
  baseURL: url,
})
