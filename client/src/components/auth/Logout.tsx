// import React from "react"
// import { useMutation } from "@tanstack/react-query"
// import { useTRPC } from "../../utils/trpc"
import { useNavigate } from "react-router"
import { SignOut } from "@phosphor-icons/react"
// import ErrorMutation from "../../layout/ErrorMutation"
import { authClient } from "../../lib/auth-client"

const Logout = () => {
  const navigate = useNavigate()
  // const session = authClient.useSession()
  // const trpc = useTRPC()
  // const mutation = useMutation(trpc.logout.mutationOptions())
  const logout = async () => {
    try {
      await authClient.signOut()
      navigate("/login")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <button id="logout-button" onClick={logout} className="btn-blue flex items-center">
        <SignOut className="mr-2" /> Logout
      </button>
    </div>
  )
}
export default Logout
