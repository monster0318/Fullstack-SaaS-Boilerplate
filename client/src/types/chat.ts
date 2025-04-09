export type MessageType = "text" | "system" | "error"

export interface ChatMessage {
  // type: MessageType
  message: string
  createdAt: Date
  // senderId?: string
}

export interface ChatEvent {
  type: "message" | "connection" | "error"
  message: ChatMessage
}
