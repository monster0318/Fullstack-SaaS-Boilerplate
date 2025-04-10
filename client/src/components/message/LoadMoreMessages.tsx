import React from "react"
import { useTRPC } from "../../lib/trpc"
import { useQuery } from "@tanstack/react-query"
import { ChatMessage } from "../../pages/ChatPage"

type Props = {
  oldestMessageTimestamp: string
  onLoadMore: (messages: ChatMessage[]) => void
}

const LoadMoreMessages: React.FC<Props> = ({ oldestMessageTimestamp, onLoadMore }) => {
  const trpc = useTRPC()

  const dataQuery = useQuery(trpc.message.getMessages.queryOptions({ before: oldestMessageTimestamp }))

  const handleLoadMore = async () => {
    const result = await dataQuery.refetch()
    if (result.data) {
      console.log("result.data", result.data)
      onLoadMore(result.data)
    }
  }

  return (
    <div className="">
      <button onClick={handleLoadMore} disabled={dataQuery.isFetching} className="btn btn-white">
        {dataQuery.isFetching ? "Loading..." : "Load More"}
      </button>
    </div>
  )
}

export default LoadMoreMessages
