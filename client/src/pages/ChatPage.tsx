import Chat from "../components/message/Chat"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "../lib/trpc"
import { RouterOutput } from "../lib/trpc"
export type ChatMessage = RouterOutput["message"]["getMessages"][number]

const ChatPage = () => {
  const trpc = useTRPC()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [initialTimestamp] = useState(() => new Date().toISOString())
  const dataQuery = useQuery(trpc.message.getMessages.queryOptions({ before: initialTimestamp }))

  useEffect(() => {
    if (dataQuery.data) {
      setMessages(dataQuery.data)
    }
  }, [dataQuery.data])

  return <Chat messages={messages} setMessages={setMessages} />
}

export default ChatPage
