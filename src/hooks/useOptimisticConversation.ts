import { useOptimistic } from "react";
import { OptimisticMessage, ConversationWithOptimisticMessages, UseOptimisticConversationProps } from "@/types"

export const useOptimisticConversation = ({ initialConversation }: UseOptimisticConversationProps) => {
    const [optimisticConversation, addOptimisticMessage] = useOptimistic(
        initialConversation,
        (conversation: ConversationWithOptimisticMessages, newMessage: OptimisticMessage): ConversationWithOptimisticMessages => (
            {
                ...conversation,
                messages: [...conversation.messages, newMessage]
            }
        )
    )

    return { optimisticConversation, addOptimisticMessage }
}


