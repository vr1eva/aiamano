import { fetchThread, fetchMessages, listAssistants } from "@/actions";
import { currentUser } from "@clerk/nextjs";
import Thread from "@/components/thread";
import { AssistantMetadata } from "@/types";
import { Assistant } from "openai/resources/beta/assistants/assistants";
import Navbar from "@/components/navbar";
import Assistants from "@/components/assistants";

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
    return <p>Failed to list all assistants.</p>;
  }

  const assistant = assistants.find(
    (assistant: Assistant) => assistant.id === assistantId
  );
  if (!assistant) {
    return <p>Failed to retrieve current assistant</p>;
  }

  const { thread, success: threadFound } = await fetchThread({
    assistantId,
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

  const {
    avatarUrl: assistantAvatarUrl,
    duty,
    chalk,
  } = assistant.metadata as AssistantMetadata;
  const { imageUrl: userAvatarUrl } = user;

  const participants = {
    user: { avatar: userAvatarUrl },
    assistant: { avatar: assistantAvatarUrl },
  };

  return (
    <div>
      <Navbar />
      <Assistants />
      <h1 className="text-xl mb-4">
        Now talking with <span className="font-bold">{assistant.name} </span>
        about <span className="font-bold capitalize">{duty}</span>
      </h1>
      <Thread
        assistantId={assistantId}
        threadId={thread.id}
        messages={messages}
        participants={participants}
      />
    </div>
  );
}
