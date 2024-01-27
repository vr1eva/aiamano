import { UserButton } from "@clerk/nextjs";
import { Chat } from "@/components/chat";
import { fetchThread, fetchMessages, listAssistants } from "@/actions";
import { currentUser } from "@clerk/nextjs/server";
import Assistants from "@/components/assistants";

export default async function Home() {
  const { success: assistantsRetrieved, assistants } = await listAssistants();
  if (!assistantsRetrieved || !assistants) {
    return <p>Problem loading assistants.</p>;
  }

  const { thread, success: threadFetched } = await fetchThread();

  if (!threadFetched || !thread) {
    return <p>We had a problem loading the chat, please refresh the page.</p>;
  }

  const { messages, success: messagesFetched } = await fetchMessages({
    threadId: thread.id,
  });

  if (!messagesFetched || !messages) {
    return null;
  }

  const user = await currentUser();
  if (!user) {
    return <p>Problem detected fetching user.</p>;
  }

  return (
    <div>
      <Navbar />
      <Assistants assistants={assistants} />
      <Chat messages={messages.data} userAvatar={user.imageUrl} />
    </div>
  );
}

function Navbar() {
  return (
    <div className="flex justify-between py-2">
      <h1 className="font-bold">Voicechat</h1>
      <ul className="flex gap-2">
        <UserButton afterSignOutUrl="/" />
      </ul>
    </div>
  );
}
