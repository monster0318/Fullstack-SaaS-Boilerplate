import React from "react"
import { useTRPC } from "../../lib/trpc"
import { useQuery } from "@tanstack/react-query"
import { ChatMessage } from "../../pages/ChatPage"

interface LoadMoreMessagesProps {
  oldestMessageTimestamp: string
  onLoadMore: (messages: ChatMessage[]) => void
}

const LoadMoreMessages: React.FC<LoadMoreMessagesProps> = ({ oldestMessageTimestamp, onLoadMore }) => {
  const trpc = useTRPC()

  const dataQuery = useQuery(trpc.message.getMessages.queryOptions({ before: oldestMessageTimestamp }))

  const handleLoadMore = async () => {
    const result = await dataQuery.refetch()
    if (result.data) {
      onLoadMore(result.data)
    }
  }

  return (
    <div className="">
      <button onClick={handleLoadMore} disabled={dataQuery.isFetching} className="btn btn-blue w-32">
        {dataQuery.isFetching ? "Loading..." : "Load More"}
      </button>
    </div>
  )
}

export default LoadMoreMessages
