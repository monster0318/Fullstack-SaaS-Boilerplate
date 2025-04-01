import { NavLink } from "react-router"
import { House, Devices, Users, PencilLine, BeerStein, Moon, Sun, GithubLogo } from "@phosphor-icons/react"
import { authClient } from "../lib/auth-client"
import { useContext } from "react"
import { AppContext } from "../ContextProvider"

type Props = {
  onClick: () => void
}

const NavLinks = (props: Props) => {
  const session = authClient.useSession()
  const { isDarkMode, toggleDarkMode } = useContext(AppContext)

  return (
    <div>
      <nav className="px-4 py-6">
        <NavLink
          onClick={props.onClick}
          to="/"
          className={({ isActive }) =>
            `block py-2.5 px-4 rounded-sm transition ${
              isActive ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-900"
            }`
          }
        >
          <div className="flex items-center">
            <House className="mr-2" />
            Home
          </div>
        </NavLink>
        <NavLink
          onClick={props.onClick}
          to="/beers"
          className={({ isActive }) =>
            `block py-2.5 px-4 rounded-sm transition ${
              isActive ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-900"
            }`
          }
        >
          <div className="flex items-center">
            <BeerStein className="mr-2" />
            Beers
          </div>
        </NavLink>
        {session.data?.user && (
          <NavLink
            onClick={props.onClick}
            to="/users"
            className={({ isActive }) =>
              `block py-2.5 px-4 rounded-sm transition ${
                isActive ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-900"
              }`
            }
          >
            <div className="flex items-center">
              <Users className="mr-2" />
              Users
            </div>
          </NavLink>
        )}
        {session.data?.user && (
          <NavLink
            onClick={props.onClick}
            to="/sessions"
            className={({ isActive }) =>
              `block py-2.5 px-4 rounded-sm transition ${
                isActive ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-900"
              }`
            }
          >
            <div className="flex items-center">
              <Devices className="mr-2" />
              Sessions
            </div>
          </NavLink>
        )}
        <NavLink
          onClick={props.onClick}
          to="/contact"
          className={({ isActive }) =>
            `block py-2.5 px-4 rounded-sm transition ${
              isActive ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-900"
            }`
          }
        >
          <div className="flex items-center">
            <PencilLine className="mr-2" />
            Contact
          </div>
        </NavLink>
        <NavLink
          onClick={props.onClick}
          to="https://github.com/alan345/Fullstack-SaaS-Boilerplate"
          className={({ isActive }) =>
            `block py-2.5 px-4 rounded-sm transition ${
              isActive ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-900"
            }`
          }
        >
          <div className="flex items-center">
            <GithubLogo className="mr-2" />
            Github
          </div>
        </NavLink>
        <div className="mt-10">
          <button
            onClick={toggleDarkMode}
            className="block py-2.5 px-4 rounded-sm transition hover:bg-gray-100 dark:hover:bg-gray-900 w-full text-left"
          >
            <div className="flex items-center">
              {isDarkMode ? <Sun className="mr-2" /> : <Moon className="mr-2" />}
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </div>
          </button>
        </div>
      </nav>
    </div>
  )
}
export default NavLinks
