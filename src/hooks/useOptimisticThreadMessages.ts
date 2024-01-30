import { useOptimistic } from "react";
import { UseOptimisticThreadProps } from "@/types";
import {
  ThreadMessage,
} from "openai/resources/beta/threads/messages/messages";

export const useOptimisticThreadMessages = ({
  initialMessages,
}: UseOptimisticThreadProps) => {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    initialMessages,
    (
      messages: ThreadMessage[],
      newMessage: ThreadMessage
    ): ThreadMessage[] => [...messages, newMessage]
  );

  return { optimisticMessages, addOptimisticMessage };
};
