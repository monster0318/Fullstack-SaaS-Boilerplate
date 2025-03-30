import React from "react"

type ContextType = {
  isDarkMode: boolean
  toggleDarkMode: () => void
}
const initialContext: ContextType = {
  isDarkMode: false,
  toggleDarkMode: () => {},
}
export const AppContext = React.createContext<ContextType>(initialContext)

type Props = {
  children: React.ReactNode
}

const ContextProvider = (props: Props) => {
  const [isDarkMode, setIsDarkMode] = React.useState(false)

  const toggleDarkMode = React.useCallback(() => {
    setIsDarkMode((prev) => !prev)
  }, [])

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
      }}
    >
      {props.children}
    </AppContext.Provider>
  )
}
export default ContextProvider
