import React, { useState, useEffect } from "react"
import { ChatMessage } from "../../pages/ChatPage"
import MessageInput from "./MessageInput"
import Message from "./Message"
import SSEConnection from "./SSEConnection"
import { authClient } from "../../lib/auth-client"
import AuthButtons from "../../auth/AuthButtons"
import LoadMoreMessages from "./LoadMoreMessages"
import { MessageSquare } from "lucide-react"

const formatDate = (dateString: string) => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const date = new Date(dateString)
  const isToday = date.toDateString() === today.toDateString()
  const isYesterday = date.toDateString() === yesterday.toDateString()

  if (isToday) return "Today"
  if (isYesterday) return "Yesterday"

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

interface ChatProps {
  messages: ChatMessage[]
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
}

const Chat: React.FC<ChatProps> = ({ messages, setMessages }) => {
  const session = authClient.useSession()
  const [groupedMessages, setGroupedMessages] = useState<[string, ChatMessage[]][]>([])
  const [oldestMessageTimestamp, setOldestMessageTimestamp] = useState<string>(() => new Date().toISOString())
  const [hasMoreMessages, setHasMoreMessages] = useState(true)

  const handleLoadMore = (newMessages: ChatMessage[]) => {
    if (newMessages.length > 0) {
      setMessages((prev) => [...prev, ...newMessages])
      // setOldestMessageTimestamp(newMessages[newMessages.length - 1].createdAt)
    } else {
      setHasMoreMessages(false)
    }
  }

  const groupMessagesByDay = (messages: ChatMessage[]) => {
    const grouped = messages.reduce((acc, message) => {
      const date = new Date(message.createdAt).toLocaleDateString("en-US")

      const existingGroup = acc.find((group) => group[0] === date)
      if (existingGroup) {
        existingGroup[1].push(message)
      } else {
        acc.push([date, [message]])
      }
      return acc
    }, [] as [string, ChatMessage[]][])
    return grouped
  }

  useEffect(() => {
    const groupedMessages = groupMessagesByDay(messages)
    setGroupedMessages(groupedMessages)
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

      <div className="flex flex-col-reverse gap-4 h-[calc(100vh-200px)] overflow-y-scroll border border-gray-300 mb-2.5 p-1.5">
        {groupedMessages.map((group) => (
          <React.Fragment key={group[0]}>
            {group[1].map((msg, index) => (
              <Message key={index} message={msg} />
            ))}
            <div className="flex items-center justify-center gap-4 my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <p className="text-lg font-bold whitespace-nowrap">{formatDate(group[0])}</p>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
          </React.Fragment>
        ))}
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
