import React, { useState, useEffect, useRef, useCallback } from "react"
import { ChatEvent, ChatMessage } from "../types/chat"
import { useTRPC } from "../lib/trpc"
import { useMutation } from "@tanstack/react-query"

interface ChatProps {
  messages: ChatMessage[]
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
}

const Chat: React.FC<ChatProps> = ({ messages, setMessages }) => {
  const [input, setInput] = useState("")
  const eventSource = useRef<EventSource | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const trpc = useTRPC()

  const sendMessageMutation = useMutation(trpc.message.sendMessage.mutationOptions())

  const connectSSE = useCallback(() => {
    // Ensure we use the correct port, matching the server setup (default 2022)
    const sseUrl = `http://localhost:2022/sse`
    eventSource.current = new EventSource(sseUrl, { withCredentials: true })

    eventSource.current.onopen = () => {
      console.log("SSE Connected")
      setIsConnected(true)
      setMessages((prev) => [
        ...prev,
        {
          // type: "system",
          message: "Connected to chat",
          createdAt: new Date(),
        },
      ])
    }

    eventSource.current.onmessage = (event) => {
      try {
        const chatEvent: ChatEvent = JSON.parse(event.data)
        console.log("Received message:", chatEvent)
        setMessages((prev) => [...prev, chatEvent.message])
      } catch (error) {
        console.error("Error parsing message:", error)
        setMessages((prev) => [
          ...prev,
          {
            // type: "error",
            message: "Error receiving message",
            createdAt: new Date(),
          },
        ])
      }
    }

    eventSource.current.onerror = (error) => {
      console.error("SSE Error:", error)
      setIsConnected(false)

      // Check if the connection was closed due to authentication error
      if (eventSource.current?.readyState === EventSource.CLOSED) {
        setMessages((prev) => [
          ...prev,
          {
            type: "error",
            message: "Authentication failed. Please log in again.",
            createdAt: new Date(),
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: "error",
            message: "Error connecting to chat. Retrying...",
            createdAt: new Date(),
          },
        ])
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

  const sendMessage = async () => {
    if (input.trim()) {
      try {
        await sendMessageMutation.mutateAsync({ message: input })
        setInput("")
      } catch (error) {
        console.error("Error sending message:", error)
        setMessages((prev) => [
          ...prev,
          {
            type: "error",
            message: error instanceof Error ? error.message : "Error sending message",
            createdAt: new Date(),
          },
        ])
      }
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      sendMessage()
    }
  }

  return (
    <div>
      <div
        style={{ height: "300px", overflowY: "scroll", border: "1px solid #ccc", marginBottom: "10px", padding: "5px" }}
      >
        {messages.map((msg, index) => (
          <div key={index}>{msg.message}</div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={!isConnected}
      />
      <button onClick={sendMessage} disabled={!isConnected || sendMessageMutation.isPending}>
        {sendMessageMutation.isPending ? "Sending..." : "Send"}
      </button>
    </div>
  )
}

export default Chat
