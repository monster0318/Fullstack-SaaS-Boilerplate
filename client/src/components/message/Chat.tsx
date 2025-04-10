import React, { useState, useEffect } from "react"
import { ChatMessage } from "../../pages/ChatPage"
import MessageInput from "./MessageInput"
import SSEConnection from "./SSEConnection"
import { authClient } from "../../lib/auth-client"
import AuthButtons from "../../auth/AuthButtons"
import LoadMoreMessages from "./LoadMoreMessages"
import { MessageSquare } from "lucide-react"
import MessageGroup from "./MessageGroup"
import ChatContainer from "./ChatContainer"

interface ChatProps {
  messages: ChatMessage[]
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
}

const Chat: React.FC<ChatProps> = ({ messages, setMessages }) => {
  const session = authClient.useSession()
  const [oldestMessageTimestamp, setOldestMessageTimestamp] = useState<string>(() => new Date().toISOString())
  const [hasMoreMessages, setHasMoreMessages] = useState(true)

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

      <ChatContainer
        oldestMessageTimestamp={oldestMessageTimestamp}
        onLoadMore={handleLoadMore}
        hasMoreMessages={hasMoreMessages}
      >
        <MessageGroup messages={messages} />
      </ChatContainer>

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
