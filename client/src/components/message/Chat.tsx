import React, { useState, useEffect, useRef } from "react"
import { ChatMessage } from "../../pages/ChatPage"
import MessageInput from "./MessageInput"
import SSEConnection from "./SSEConnection"
import { authClient } from "../../lib/auth-client"
import AuthButtons from "../../auth/AuthButtons"
import LoadMoreMessages from "./LoadMoreMessages"
import { MessageSquare } from "lucide-react"
import MessageGroup from "./MessageGroup"

interface ChatProps {
  messages: ChatMessage[]
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
}

const Chat: React.FC<ChatProps> = ({ messages, setMessages }) => {
  const session = authClient.useSession()
  const [oldestMessageTimestamp, setOldestMessageTimestamp] = useState<string>(() => new Date().toISOString())
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const chatContainer = chatContainerRef.current
    if (!chatContainer) return

    const handleScroll = () => {
      const threshold = 5
      const isAtTop =
        Math.abs(chatContainer.scrollHeight - chatContainer.clientHeight + chatContainer.scrollTop) <= threshold

      if (isAtTop) {
        console.log("User scrolled to the top!")
      }
    }

    handleScroll()

    chatContainer.addEventListener("scroll", handleScroll)
    return () => {
      chatContainer.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleLoadMore = (newMessages: ChatMessage[]) => {
    if (newMessages.length > 0) {
      setMessages((prev) => [...prev, ...newMessages])
    } else {
      setHasMoreMessages(false)
    }
  }

  useEffect(() => {
    if (messages.length > 0) {
      setOldestMessageTimestamp(messages[messages.length - 1].createdAt)
    }
  }, [messages])

  const handleNewMessage = (message: ChatMessage) => {
    setMessages((prev) => [message, ...prev])
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="text-3xl mr-3" />
        <h1 className="text-2xl font-bold mr-1">Chat</h1>
        <SSEConnection onMessage={handleNewMessage} />
      </div>

      <div
        ref={chatContainerRef}
        className="flex flex-col-reverse gap-4 h-[calc(100vh-200px)] overflow-y-scroll border border-gray-300 mb-2.5 p-1.5"
      >
        <MessageGroup messages={messages} />
        {hasMoreMessages && (
          <LoadMoreMessages oldestMessageTimestamp={oldestMessageTimestamp} onLoadMore={handleLoadMore} />
        )}
      </div>
      {session.data?.user ? (
        <MessageInput isConnected={true} />
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
