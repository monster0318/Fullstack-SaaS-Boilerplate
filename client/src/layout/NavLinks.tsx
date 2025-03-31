import { NavLink } from "react-router"
import { House, Devices, Users, PencilLine, BeerStein, Moon, Sun } from "@phosphor-icons/react"
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
    <nav className="px-4 py-6">
      <NavLink
        onClick={props.onClick}
        to="/"
        className={({ isActive }) =>
          `block py-2.5 px-4 rounded-sm transition ${
            isActive ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800"
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
            isActive ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800"
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
              isActive ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800"
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
              isActive ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800"
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
            isActive ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`
        }
      >
        <div className="flex items-center">
          <PencilLine className="mr-2" />
          Contact
        </div>
      </NavLink>
      <button
        onClick={toggleDarkMode}
        className="block py-2.5 px-4 rounded-sm transition hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left"
      >
        <div className="flex items-center">
          {isDarkMode ? <Sun className="mr-2" /> : <Moon className="mr-2" />}
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </div>
      </button>
      <a
        href="https://github.com/alan345/Fullstack-SaaS-Boilerplate"
        className="block py-2.5 px-4 rounded-sm transition hover:bg-gray-100 dark:hover:bg-gray-800"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg"
          alt="GitHub"
          className="inline-block h-6 w-6"
        />
      </a>
    </nav>
  )
}
export default NavLinks
