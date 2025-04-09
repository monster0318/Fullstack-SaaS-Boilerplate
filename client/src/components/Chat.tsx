import React, { useState, useEffect, useRef, useCallback } from "react"
import { ChatEvent, ChatMessage } from "../types/chat"

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const ws = useRef<WebSocket | null>(null)

  const connectWebSocket = useCallback(() => {
    // Ensure we use the correct port, matching the server setup (default 2022)
    const wsUrl = `ws://localhost:2022/ws`
    ws.current = new WebSocket(wsUrl)

    ws.current.onopen = () => {
      console.log("WebSocket Connected")
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          content: "Connected to chat",
          timestamp: Date.now(),
        },
      ])
    }

    ws.current.onmessage = (event) => {
      try {
        const chatEvent: ChatEvent = JSON.parse(event.data)
        setMessages((prev) => [...prev, chatEvent.message])
      } catch (error) {
        console.error("Error parsing message:", error)
        setMessages((prev) => [
          ...prev,
          {
            type: "error",
            content: "Error receiving message",
            timestamp: Date.now(),
          },
        ])
      }
    }

    ws.current.onerror = (error) => {
      console.error("WebSocket Error:", error)
      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          content: "Error connecting to chat",
          timestamp: Date.now(),
        },
      ])
    }

    ws.current.onclose = () => {
      console.log("WebSocket Disconnected")
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          content: "Disconnected. Attempting to reconnect...",
          timestamp: Date.now(),
        },
      ])
      // Optional: Implement reconnection logic
      // setTimeout(connectWebSocket, 5000); // Attempt reconnect after 5 seconds
    }
  }, [])

  useEffect(() => {
    connectWebSocket()
    // Clean up WebSocket connection when component unmounts
    return () => {
      ws.current?.close()
    }
  }, [connectWebSocket])

  const sendMessage = () => {
    if (ws.current?.readyState === WebSocket.OPEN && input.trim()) {
      const message: ChatMessage = {
        type: "text",
        content: input,
        timestamp: Date.now(),
      }
      const event: ChatEvent = {
        type: "message",
        message: message,
      }
      ws.current.send(JSON.stringify(event))
      setInput("")
    } else {
      console.log("WebSocket not connected or input is empty")
      // Optionally provide user feedback
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
      <h2>Simple Chat</h2>
      <div
        style={{ height: "300px", overflowY: "scroll", border: "1px solid #ccc", marginBottom: "10px", padding: "5px" }}
      >
        {messages.map((msg, index) => (
          <div key={index} style={{ color: msg.type === "error" ? "red" : msg.type === "system" ? "gray" : "black" }}>
            {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  )
}

export default Chat
