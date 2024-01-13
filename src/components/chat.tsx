import {Form} from "@/components/ui/form"
import { Conversation, Message } from "@prisma/client"

type ExtendedConversation = Conversation & {
  messages: Message[];
};

export async function Chat({conversation}: {conversation: ExtendedConversation}) {

  return (
    <>
    <ul>
      {conversation.messages.slice(1).map((message: Message) => (
        <li key={message.id}>{message.content}</li>
      )) }
    </ul>
    <Form />
    </>
  )
}

