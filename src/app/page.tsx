import { UserButton } from "@clerk/nextjs";
import {Chat} from "@/components/chat"
import { getConversation } from "@/actions"
import Image from "next/image";
 
export default async function Home() {
  const conversation = await getConversation()
  if(!conversation) return <p>We had a problem loading the chat, please refresh the page.</p>
  
  return (
    <div className="h-screen">
      <h1>Chat with Oliver Tree</h1>
      <Image src="https://res.cloudinary.com/vr1/image/upload/v1705181913/g5t0w2foz0dfgbuut371.jpg" alt="Oliver Tree image" width={80} height={100} />
      <UserButton afterSignOutUrl="/"/>
      <Chat conversation={conversation} />
    </div>
  )
}