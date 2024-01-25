import { UserButton } from "@clerk/nextjs";
import { Chat } from "@/components/chat"
import { fetchThread, fetchMessages } from "@/actions"
import { Suspense } from 'react'
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const { thread, success: threadFetched } = await fetchThread()
  if (!threadFetched || !thread) return <p>We had a problem loading the chat, please refresh the page.</p>

  const user = await currentUser()
  if (!user) {
    return <p>Problem detected fetching user.</p>
  }

  const messages = await fetchMessages({ threadId: thread.id })

  return (
    <div>
      <Navbar />
      <Suspense fallback={<p>Loading...</p>}>
        <Chat thread={thread} messages={messages} userAvatar={user.imageUrl} />P
      </Suspense>
    </div>
  )
}

function Navbar() {
  return (
    <div className="flex justify-between py-2">
      <h1 className="font-bold">Voicechat</h1>
      <ul className="flex gap-2" >
        <UserButton afterSignOutUrl="/" />
      </ul>
    </div>
  )
}