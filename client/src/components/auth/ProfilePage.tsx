import ProfileQuery from "./ProfileQuery"
import SessionData from "./SessionData"
import Logout from "./Logout"
import { Link } from "react-router"
import { Devices } from "@phosphor-icons/react"
import { UserCircle } from "@phosphor-icons/react"
import { authClient } from "../../lib/auth-client"
// yuYU7878jOo9(
const ProfilePage = () => {
  // const context = React.useContext(AppContext)
  const session = authClient.useSession()
  // if (!context.me) {
  //   return null
  // }

  if (!session.data?.user) {
    return null
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <UserCircle className="text-3xl mr-3" />
          <h1>Profile</h1>
        </div>

        <Logout />
      </div>
      <ProfileQuery meId={session.data.user.id} />
      <div className="mt-2">
        <Link className="link" to={`/devices?userId=${session.data.user.id}`}>
          <button className="btn-white">
            <div className="flex items-center">
              <Devices className="text-xl mr-2" /> Devices
            </div>
          </button>
        </Link>
      </div>
      <SessionData />
    </div>
  )
}
export default ProfilePage
