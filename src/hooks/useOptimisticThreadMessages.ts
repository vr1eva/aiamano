import { useOptimistic } from "react";
import { OptimisticThreadMessage, UseOptimisticThreadProps } from "@/types";

export const useOptimisticThreadMessages = ({
  initialMessages,
}: UseOptimisticThreadProps) => {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    initialMessages,
    (
      messages: OptimisticThreadMessage[],
      newMessage: OptimisticThreadMessage
    ): OptimisticThreadMessage[] => [...messages, newMessage]
  );

  return { optimisticMessages, addOptimisticMessage };
};
