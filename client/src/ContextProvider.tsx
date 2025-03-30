import React from "react"
// import { useQuery } from "@tanstack/react-query"
// import { useTRPC } from "./utils/trpc"

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
  // const trpc = useTRPC()
  // const getAuthQuery = useQuery(trpc.getAuth.queryOptions(undefined, { retry: false }))

  // const [isLoadingAuth, setIsLoadingAuth] = React.useState(false)
  // const [me, setMe] = React.useState<ContextType["me"]>(null)
  // const [decoded, setDecoded] = React.useState<ContextType["decoded"]>(null)
  // const [deviceId, setDeviceId] = React.useState<ContextType["deviceId"]>(null)
  const [isDarkMode, setIsDarkMode] = React.useState(false)

  const toggleDarkMode = React.useCallback(() => {
    setIsDarkMode((prev) => !prev)
  }, [])

  // const updateAuth = async () => {
  //   await getAuthQuery.refetch()
  // }

  // React.useEffect(() => {
  //   setIsLoadingAuth(getAuthQuery.isLoading)
  //   if (getAuthQuery.isError) {
  //     setMe(null)
  //     return
  //   }
  //   if (getAuthQuery.data) {
  //     setMe(getAuthQuery.data.user)
  //     setDecoded(getAuthQuery.data.decoded)
  //     setDeviceId(getAuthQuery.data.deviceid)
  //   }
  // }, [getAuthQuery])

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
