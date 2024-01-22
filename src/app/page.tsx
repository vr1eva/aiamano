import { UserButton } from "@clerk/nextjs";
import { Chat } from "@/components/chat"
import { getConversation } from "@/actions"
import { Suspense } from 'react'
import Link from "next/link"
import Image from "next/image"
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const { conversation, success: conversationFetched } = await getConversation()
  if (!conversationFetched || !conversation) return <p>We had a problem loading the chat, please refresh the page.</p>

  const user = await currentUser()
  if (!user) {
    return <p>Problem detected fetching user.</p>
  }

  return (
    <div>
      <Navbar />
      <Suspense fallback={<p>Loading...</p>}>
        <Chat conversation={conversation} userAvatar={user.imageUrl} />
      </Suspense>
    </div>
  )
}

function Navbar() {
  return (
    <div className="flex justify-between py-2">
      <h1 className="font-bold">Voicechat</h1>
      <ul className="flex gap-2" >
        <li><Link href="/notifications" />
          <Image src="/notifications.svg" width={32} height={32} alt="notification bell" />
        </li>
        <UserButton afterSignOutUrl="/" />
      </ul>
    </div>
  )
}