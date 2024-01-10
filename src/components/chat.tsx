import { SubmitButton } from '@/components/submit-button'
import { getCompletion, getConversation } from "@/actions"

export async function Chat() {
  const conversation = await getConversation()

  if(!conversation) return <p>We had a problem loading the chat, please refresh the page.</p>

  return (
    <>
    <ul>
      {conversation.messages.map(message => (
        <li key={message.id}>{message.content}</li>
      )) }
    </ul>
    <form action={getCompletion}>
      <input type="text" name="prompt" />
      <SubmitButton/>
    </form>
    </>
  )
}