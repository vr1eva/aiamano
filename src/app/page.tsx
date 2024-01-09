import { UserButton } from "@clerk/nextjs";
import {Chat} from "@/components/chat"
 
export default function Home() {
  return (
    <div className="h-screen">
      <UserButton afterSignOutUrl="/"/>
      <Chat/>
    </div>
  )
}