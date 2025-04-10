import React, { useState, useEffect, useCallback } from "react"
import { CircleDot, CircleDotDashed } from "lucide-react"
import { ChatMessage } from "../../pages/ChatPage"

export type MessageType = "text" | "system" | "error"

export interface ChatEvent {
  type: "message" | "connection" | "error"
  message: ChatMessage
}

interface SSEConnectionProps {
  onMessage: (message: ChatMessage) => void
}

const SSEConnection: React.FC<SSEConnectionProps> = ({ onMessage }) => {
  const [eventSource, setEventSource] = useState<EventSource | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const connectSSE = useCallback(() => {
    const sseUrl = `${import.meta.env.VITE_URL_BACKEND}/sse`
    const newEventSource = new EventSource(sseUrl, { withCredentials: true })

    newEventSource.onopen = () => {
      console.log("SSE Connected")
      setIsConnected(true)
    }

    newEventSource.onmessage = (event) => {
      try {
        const chatEvent: ChatEvent = JSON.parse(event.data)
        console.log("Received message:", chatEvent)
        if (chatEvent.type === "message") {
          onMessage(chatEvent.message)
        }
      } catch (error) {
        console.error("Error parsing message:", error)
        setIsConnected(false)
      }
    }

    newEventSource.onerror = (error) => {
      console.error("SSE Error:", error)
      setIsConnected(false)

      if (newEventSource.readyState === EventSource.CLOSED) {
        console.log("Authentication failed. Please log in again.")
      }
    }

    setEventSource(newEventSource)
  }, [onMessage])

  useEffect(() => {
    console.log("connectSSE")
    connectSSE()
    return () => {
      eventSource?.close()
    }
  }, [connectSSE, eventSource])

  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <CircleDot className="w-4 h-4 text-green-500" aria-label="Connected" />
      ) : (
        <CircleDotDashed className="w-4 h-4 text-red-500 animate-spin" aria-label="Disconnected" />
      )}
    </div>
  )
}

export default SSEConnection
