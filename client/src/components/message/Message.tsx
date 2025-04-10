import React from "react"
import ImgAvatar from "../../layout/ImgAvatar"
import { ChatMessage } from "../../pages/ChatPage"

interface MessageProps {
  message: ChatMessage
}

const Message: React.FC<MessageProps> = ({ message }) => {
  return (
    <div className="flex items-start gap-3">
      <ImgAvatar src={message.sender?.image} alt={message.sender?.name || "User"} className="w-10 h-10" />
      <div className="flex flex-col">
        <div className="text-sm text-gray-500">
          {message.sender?.name || "Anonymous"} •{" "}
          {new Date(message.createdAt).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
        </div>
        <div className="text-gray-800 dark:text-gray-200">{message.message}</div>
      </div>
    </div>
  )
}

export default Message
