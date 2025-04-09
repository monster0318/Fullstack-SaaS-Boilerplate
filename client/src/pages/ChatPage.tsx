import Chat from "../components/Chat"
import { useEffect, useState } from "react"
import { ChatMessage } from "../types/chat"
import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "../lib/trpc"

const ChatPage = () => {
  const trpc = useTRPC()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const dataQuery = useQuery(trpc.message.getMessages.queryOptions())

  useEffect(() => {
    if (dataQuery.data) {
      setMessages(
        dataQuery.data
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          .map((message) => ({
            ...message,
            createdAt: new Date(message.createdAt),
            // senderId: message.senderId || undefined,
          }))
      )
    }
  }, [dataQuery.data])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>
      <Chat messages={messages} setMessages={setMessages} />
    </div>
  )
}

export default ChatPage
