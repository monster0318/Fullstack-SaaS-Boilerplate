import { useMutation } from "@tanstack/react-query"
import { useTRPC } from "../../utils/trpc"
import { Trash } from "@phosphor-icons/react"
import ErrorMutation from "../../layout/ErrorMutation"

type Props = {
  sessionId: string
  onDelete: () => void
}
const DeleteSession = (props: Props) => {
  const trpc = useTRPC()
  const mutation = useMutation(trpc.deleteSession.mutationOptions())
  const logout = async () => {
    try {
      await mutation.mutateAsync({
        sessionId: props.sessionId,
      })
      props.onDelete()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <button
        id="delete-session-button"
        disabled={mutation.isPending}
        onClick={logout}
        className="btn-white flex items-center"
      >
        <Trash className="mr-2" /> Delete
      </button>
      {mutation.error && <ErrorMutation data={mutation.error} />}
    </div>
  )
}
export default DeleteSession
