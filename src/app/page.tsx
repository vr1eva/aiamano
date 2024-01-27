import { UserButton } from "@clerk/nextjs";
import { Chat } from "@/components/chat";
import { fetchThread, fetchMessages } from "@/actions";
import { currentUser } from "@clerk/nextjs/server";
import Assistants from "@/components/assistants";

export default async function Home() {
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
      <Chat messages={messages.data} userAvatar={user.imageUrl} />
    </div>
  );
}

function Navbar() {
  return (
    <div className="flex justify-between py-2">
      <h1 className="font-bold">Voicechat</h1>
      <ul className="flex gap-2">
        <Assistants />
        <UserButton afterSignOutUrl="/" />
      </ul>
    </div>
  );
}
