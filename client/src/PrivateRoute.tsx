import React from "react"
import AuthButtons from "./auth/AuthButtons"
import { Bug } from "@phosphor-icons/react"
import { authClient } from "./lib/auth-client"
type Props = {
  element: React.ReactNode
}

const PrivateRoute = (props: Props) => {
  const session = authClient.useSession()
  console.log(session.data?.user)
  if (session.isPending) return <div className="p-6">Loading!</div>
  if (!session.data?.user.role) {
    return (
      <div className="p-6">
        <div className="flex items-center">
          <Bug className="text-3xl mr-3" />
          <h1>Error</h1>
        </div>
        <p>This page is private.</p>
        <div className="mt-8">
          <AuthButtons />
        </div>
      </div>
    )
  }
  return <>{props.element}</>
}

export default PrivateRoute
