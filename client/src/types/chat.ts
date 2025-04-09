export type MessageType = "text" | "system" | "error"

export interface ChatMessage {
  type: MessageType
  content: string
  timestamp: number
  senderId?: string
}

export interface ChatEvent {
  type: "message" | "connection" | "error"
  message: ChatMessage
}
