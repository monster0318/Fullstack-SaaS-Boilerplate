import Logout from "./Logout"
import Login from "./Login"
import { authClient } from "../../lib/auth-client"
const AuthManagement = () => {
  const session = authClient.useSession()
  if (session.data?.user) {
    return (
      <div className="p-6">
        Hey {session.data.user.name}!
        <Logout />
      </div>
    )
  }

  if (session.isPending) {
    return <div className="p-6">Loading...</div>
  }
  return <Login />
}
export default AuthManagement
