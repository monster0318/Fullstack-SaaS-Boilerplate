import React, { useState } from "react"
import { useTRPC } from "../../lib/trpc"
import { useMutation } from "@tanstack/react-query"

interface MessageInputProps {
  isConnected: boolean
  onSendMessage: (message: string) => void
}

const MessageInput: React.FC<MessageInputProps> = ({ isConnected, onSendMessage }) => {
  const [input, setInput] = useState("")
  const trpc = useTRPC()
  const sendMessageMutation = useMutation(trpc.message.sendMessage.mutationOptions())

  const handleSendMessage = async () => {
    if (input.trim()) {
      try {
        await sendMessageMutation.mutateAsync({ message: input })
        onSendMessage(input)
        setInput("")
      } catch (error) {
        console.error("Error sending message:", error)
      }
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage()
    }
  }

  return (
    <>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={!isConnected}
      />
      <button onClick={handleSendMessage} disabled={!isConnected || sendMessageMutation.isPending}>
        {sendMessageMutation.isPending ? "Sending..." : "Send"}
      </button>
    </>
  )
}

export default MessageInput
