import React, { useState, useEffect, useRef } from "react"
import { ChatMessage } from "../../pages/ChatPage"
import MessageInput from "./MessageInput"
import SSEConnection from "./SSEConnection"
import { authClient } from "../../lib/auth-client"
import AuthButtons from "../../auth/AuthButtons"
import { MessageSquare } from "lucide-react"
import MessageGroup from "./MessageGroup"
import { useTRPC } from "../../lib/trpc"
import { useQuery } from "@tanstack/react-query"

interface ChatProps {
  messages: ChatMessage[]
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
}

const Chat: React.FC<ChatProps> = ({ messages, setMessages }) => {
  const session = authClient.useSession()
  const [oldestMessageTimestamp, setOldestMessageTimestamp] = useState<string>(() => new Date().toISOString())
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const trpc = useTRPC()
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const dataQuery = useQuery(trpc.message.getMessages.queryOptions({ before: oldestMessageTimestamp }))

  const handleLoadMore = async () => {
    if (!hasMoreMessages) return
    const result = await dataQuery.refetch()
    if (result.data) {
      if (result.data.length > 0) {
        setMessages((prev) => [...prev, ...result.data])
      } else {
        setHasMoreMessages(false)
      }
    }
  }

  useEffect(() => {
    const chatContainer = chatContainerRef.current
    if (!chatContainer) return

    const handleScroll = () => {
      const threshold = 500
      const isAtTop =
        Math.abs(chatContainer.scrollHeight - chatContainer.clientHeight + chatContainer.scrollTop) <= threshold

      if (isAtTop) {
        handleLoadMore()
      }
    }

    handleScroll()

    chatContainer.addEventListener("scroll", handleScroll)
    return () => {
      chatContainer.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      setOldestMessageTimestamp(messages[messages.length - 1].createdAt)
    }
  }, [messages])

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="text-3xl mr-3" />
        <h1 className="text-2xl font-bold mr-1">Chat</h1>
        <SSEConnection
          onMessage={(message: ChatMessage) => {
            setMessages((prev) => [message, ...prev])
          }}
        />
      </div>

      <div
        ref={chatContainerRef}
        className="flex flex-col-reverse gap-4 h-[calc(100vh-200px)] overflow-y-scroll border border-gray-300 mb-2.5 p-1.5"
      >
        <MessageGroup messages={messages} />
        {dataQuery.isLoading && <div>Loading...</div>}
      </div>

      {session.data?.user ? (
        <MessageInput isConnected={true} onSendMessage={scrollToBottom} />
      ) : (
        <div>
          <p className="my-2 text-gray-500">Please login to chat</p>
          <AuthButtons />
        </div>
      )}
    </div>
  )
}

export default Chat
