import React, { ReactNode, useEffect, useRef } from "react"

import { useTRPC } from "../../lib/trpc"
import { useQuery } from "@tanstack/react-query"
import { ChatMessage } from "../../pages/ChatPage"

type Props = {
  children: ReactNode
  oldestMessageTimestamp: string
  onLoadMore: (messages: ChatMessage[]) => void
  hasMoreMessages: boolean
}

const ChatContainer: React.FC<Props> = (props) => {
  const { children, oldestMessageTimestamp, onLoadMore, hasMoreMessages } = props

  const trpc = useTRPC()

  const dataQuery = useQuery(trpc.message.getMessages.queryOptions({ before: oldestMessageTimestamp }))

  const handleLoadMore = async () => {
    if (!hasMoreMessages) return
    const result = await dataQuery.refetch()
    if (result.data) {
      console.log("result.data", result.data)
      onLoadMore(result.data)
    }
  }

  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const chatContainer = chatContainerRef.current
    if (!chatContainer) return

    const handleScroll = () => {
      const threshold = 500
      const isAtTop =
        Math.abs(chatContainer.scrollHeight - chatContainer.clientHeight + chatContainer.scrollTop) <= threshold

      if (isAtTop) {
        handleLoadMore()
      }
    }

    handleScroll()

    chatContainer.addEventListener("scroll", handleScroll)
    return () => {
      chatContainer.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div
      ref={chatContainerRef}
      className="flex flex-col-reverse gap-4 h-[calc(100vh-200px)] overflow-y-scroll border border-gray-300 mb-2.5 p-1.5"
    >
      {children}
      {dataQuery.isLoading && <div>Loading...</div>}
    </div>
  )
}

export default ChatContainer
