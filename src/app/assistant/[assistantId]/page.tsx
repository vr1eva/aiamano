import { fetchThread, fetchMessages, listAssistants } from "@/actions";
import { currentUser } from "@clerk/nextjs"
import Thread from "@/components/thread";
import { AssistantMetadata } from "@/types"
import { Assistant } from "openai/resources/beta/assistants/assistants";


export default async function Page({
  params: { assistantId },
}: {
  params: { assistantId: string };
}) {
  const user = await currentUser();
  if (!user) {
    return <p>Problem detected fetching user.</p>;
  }
  const { assistants, success: assistantsFetched } = await listAssistants();

  if (!assistantsFetched || !assistants) {
    return <p>Failed to retrieve assistant information.</p>;
  }

  const { name: assistantName } = assistants.find((assistant: Assistant) => assistant.id === assistantId)

  const { thread, success: threadFound } = await fetchThread({
    assistantId
  });

  if (!threadFound || !thread) {
    return <p>Failed to generate thread.</p>;
  }
  const { messages, success: messagesFetched } = await fetchMessages({
    threadId: thread.id,
  });
  if (!messagesFetched || !messages) {
    return <p>Failed to retrieves messages.</p>;
  }

  const { avatarUrl: assistantAvatarUrl } = assistant.metadata as AssistantMetadata
  const { imageUrl: userAvatarUrl } = user

  const participants = {
    user: { avatar: userAvatarUrl },
    assistant: { avatar: assistantAvatarUrl }
  }

  return (
    <div>
      <h1 className="text-xl">You are talking to {assistantName}</h1>
      <Thread assistantId={assistantId} threadId={thread.id} messages={messages} participants={participants} />
    </div>
  );
}
