import { retrieveAssistant, fetchThread, fetchMessages } from "@/actions";
import { currentUser } from "@clerk/nextjs"
import Thread from "@/components/thread";
import { AssistantMetadata } from "@/types"

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const user = await currentUser();
  if (!user) {
    return <p>Problem detected fetching user.</p>;
  }
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

  const { avatarUrl: assistantAvatarUrl } = assistant.metadata as AssistantMetadata
  const { imageUrl: userAvatarUrl } = user

  const participants = { user: { avatar: userAvatarUrl }, system: { avatar: assistantAvatarUrl } }

  return (
    <div>
      <h1>{assistant.name}</h1>
      <Thread messages={messages} participants={participants} />
    </div>
  );
}
