import { retrieveAssistant, fetchThread, fetchMessages } from "@/actions";
import Thread from "@/components/thread";

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const { assistant, success: assistantRetrieved } = await retrieveAssistant({
    assistantId: id,
  });
  if (!assistantRetrieved || !assistant) {
    return <p>Failed to retrieve assistant information.</p>;
  }

  const { thread, success: threadFound } = await fetchThread({
    assistantId: id,
  });
  if (!threadFound || !thread) {
    return <p>Thread not found.</p>;
  }
  const { messages, success: messagesFetched } = await fetchMessages({
    threadId: thread.id,
  });
  if (!messagesFetched || !messages) {
    return <p>Failed to retrieves messages.</p>;
  }

  return (
    <div>
      <h1>{assistant.name}</h1>
      <Thread messages={messages} />
    </div>
  );
}
