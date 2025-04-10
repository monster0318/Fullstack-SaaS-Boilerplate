import React, { useState, useEffect } from "react"
import { ChatMessage } from "../../pages/ChatPage"
import MessageInput from "./MessageInput"
import Message from "./Message"
import SSEConnection from "./SSEConnection"
import { authClient } from "../../lib/auth-client"
import AuthButtons from "../../auth/AuthButtons"

interface ChatProps {
  messages: ChatMessage[]
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
}

const Chat: React.FC<ChatProps> = ({ messages, setMessages }) => {
  const session = authClient.useSession()
  // context = use
  const [groupedMessages, setGroupedMessages] = useState<[string, ChatMessage[]][]>([])

  const groupMessagesByDay = (messages: ChatMessage[]) => {
    const grouped = messages.reduce((acc, message) => {
      const date = new Date(message.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
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
  }, [messages])

  const handleNewMessage = (message: ChatMessage) => {
    setMessages((prev) => [message, ...prev])
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Chat</h1>
        <SSEConnection onMessage={handleNewMessage} />
      </div>

      <div className="flex flex-col-reverse gap-4 h-[calc(100vh-300px)] overflow-y-scroll border border-gray-300 mb-2.5 p-1.5">
        {groupedMessages.map((group) => (
          <React.Fragment key={group[0]}>
            {group[1].map((msg, index) => (
              <Message key={index} message={msg} />
            ))}
            <h2 className="text-lg font-bold">{group[0]}</h2>
          </React.Fragment>
        ))}
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
