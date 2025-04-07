import { Link } from "react-router"
import { LogIn, Key } from "lucide-react"

const AuthButtons = () => {
  return (
    <div className="flex gap-2">
      <Link to="/login">
        <button id="login-button" className="btn-white  flex items-center">
          <LogIn className="mr-2" />
          Login
        </button>
      </Link>
      <Link to="/signup">
        <button id="signup-button" className="btn-white flex items-center">
          <Key className="mr-2" />
          Sign up
        </button>
      </Link>
    </div>
  )
}
export default AuthButtons
