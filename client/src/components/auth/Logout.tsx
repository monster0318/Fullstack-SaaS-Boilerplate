import { useNavigate } from "react-router"
import { SignOut } from "@phosphor-icons/react"
import { authClient } from "../../lib/auth-client"

const Logout = () => {
  const navigate = useNavigate()
  const logout = async () => {
    try {
      await authClient.signOut()
      navigate("/login")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <button id="logout-button" onClick={logout} className="btn-blue flex items-center">
      <SignOut className="mr-2" /> Logout
    </button>
  )
}
export default Logout
