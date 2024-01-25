import { useOptimistic } from "react";
import { OptimisticThreadMessage, ThreadWithOptimisticMessages, UseOptimisticThreadProps } from "@/types"

export const useOptimisticThread = ({ initialThread }: UseOptimisticThreadProps) => {
    const [optimisticThread, addOptimisticMessage] = useOptimistic(
        initialThread,
        (thread: ThreadWithOptimisticMessages, newMessage: OptimisticThreadMessage): ThreadWithOptimisticMessages => (
            {
                ...thread,
                messages: [...thread.messages, newMessage]
            }
        )
    )

    return { optimisticThread, addOptimisticMessage }
}


