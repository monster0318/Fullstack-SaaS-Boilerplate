import { NavLink } from "react-router"
import { House, Monitor, Users, PencilSimple, Wine, Moon, Sun, GithubLogo, Chat } from "@phosphor-icons/react"
import { authClient } from "../lib/auth-client"
import { useThemeStore } from "../store/useThemeStore"

type Props = {
  onClick: () => void
}

const NavLinks = (props: Props) => {
  const session = authClient.useSession()
  const { isDarkMode, toggleDarkMode } = useThemeStore()

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
            <House className="mr-2" weight="fill" />
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
            <Wine className="mr-2" weight="fill" />
            Beers
          </div>
        </NavLink>
        <NavLink
          onClick={props.onClick}
          to="/chat"
          className={({ isActive }) =>
            `block py-2.5 px-4 rounded-sm transition ${
              isActive ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-900"
            }`
          }
        >
          <div className="flex items-center">
            <Chat className="mr-2" weight="fill" />
            Chat
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
              <Users className="mr-2" weight="fill" />
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
              <Monitor className="mr-2" weight="fill" />
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
            <PencilSimple className="mr-2" weight="fill" />
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
            <GithubLogo className="mr-2" weight="fill" />
            Github
          </div>
        </NavLink>
        <div className="mt-10">
          <button
            onClick={toggleDarkMode}
            className="block py-2.5 px-4 rounded-sm transition hover:bg-gray-100 dark:hover:bg-gray-900 w-full text-left"
          >
            <div className="flex items-center">
              {isDarkMode ? <Sun className="mr-2" weight="fill" /> : <Moon className="mr-2" weight="fill" />}
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </div>
          </button>
        </div>
      </nav>
    </div>
  )
}
export default NavLinks
