import React, { useState, useEffect, useRef, useCallback } from "react"

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState("")
  const ws = useRef<WebSocket | null>(null)

  const connectWebSocket = useCallback(() => {
    // Ensure we use the correct port, matching the server setup (default 2022)
    const wsUrl = `ws://localhost:2022/ws`
    ws.current = new WebSocket(wsUrl)

    ws.current.onopen = () => {
      console.log("WebSocket Connected")
      setMessages((prev) => [...prev, "System: Connected to chat"])
    }

    ws.current.onmessage = (event) => {
      console.log("WebSocket Message:", event.data)
      setMessages((prev) => [...prev, event.data])
    }

    ws.current.onerror = (error) => {
      console.error("WebSocket Error:", error)
      setMessages((prev) => [...prev, "System: Error connecting to chat"])
    }

    ws.current.onclose = () => {
      console.log("WebSocket Disconnected")
      setMessages((prev) => [...prev, "System: Disconnected. Attempting to reconnect..."])
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
      ws.current.send(input)
      setInput("") // Clear input after sending
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
          <div key={index}>{msg}</div>
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
