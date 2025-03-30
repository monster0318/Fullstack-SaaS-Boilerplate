import { createAuthClient } from "better-auth/react"
const url = import.meta.env.VITE_URL_BACKEND
export const authClient = createAuthClient({
  baseURL: url,
})
