import React, { useState, useEffect, useRef, useCallback } from "react"
import { CircleDot, CircleDotDashed } from "lucide-react"
// import { ChatEvent, ChatMessage } from "../types/chat"

import { ChatMessage } from "../../pages/ChatPage"
import MessageInput from "./MessageInput"

export type MessageType = "text" | "system" | "error"

// export interface ChatMessage {
//   // type: MessageType
//   message: string
//   createdAt: Date
//   // senderId?: string
// }

export interface ChatEvent {
  type: "message" | "connection" | "error"
  message: ChatMessage
}

interface ChatProps {
  messages: ChatMessage[]
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
}

const Chat: React.FC<ChatProps> = ({ messages, setMessages }) => {
  const eventSource = useRef<EventSource | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const connectSSE = useCallback(() => {
    // Ensure we use the correct port, matching the server setup (default 2022)
    const sseUrl = `http://localhost:2022/sse`
    eventSource.current = new EventSource(sseUrl, { withCredentials: true })

    eventSource.current.onopen = () => {
      console.log("SSE Connected")
      setIsConnected(true)
    }

    eventSource.current.onmessage = (event) => {
      try {
        const chatEvent: ChatEvent = JSON.parse(event.data)
        console.log("Received message:", chatEvent)
        if (chatEvent.type === "message") {
          setMessages((prev) => [chatEvent.message, ...prev])
        }
      } catch (error) {
        console.error("Error parsing message:", error)
        setIsConnected(false)
      }
    }

    eventSource.current.onerror = (error) => {
      console.error("SSE Error:", error)
      setIsConnected(false)

      if (eventSource.current?.readyState === EventSource.CLOSED) {
        console.log("Authentication failed. Please log in again.")
      }
    }
  }, [])

  useEffect(() => {
    connectSSE()
    // Clean up EventSource connection when component unmounts
    return () => {
      eventSource.current?.close()
    }
  }, [connectSSE])

  const handleSendMessage = (message: string) => {
    console.log("Message sent:", message)
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Chat</h1>
        {isConnected ? (
          <CircleDot className="w-4 h-4 text-green-500" aria-label="Connected" />
        ) : (
          <CircleDotDashed className="w-4 h-4 text-red-500 animate-spin" aria-label="Disconnected" />
        )}
      </div>

      <div
        className="flex flex-col-reverse"
        style={{ height: "300px", overflowY: "scroll", border: "1px solid #ccc", marginBottom: "10px", padding: "5px" }}
      >
        {messages.map((msg, index) => (
          <div key={index}>{msg.message}</div>
        ))}
      </div>
      <MessageInput isConnected={isConnected} onSendMessage={handleSendMessage} />
    </div>
  )
}

export default Chat
