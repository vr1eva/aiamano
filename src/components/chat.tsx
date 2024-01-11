import { getConversation } from "@/actions"
import {Form} from "@/components/ui/form"

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
    <Form/>
    </>
  )
}

