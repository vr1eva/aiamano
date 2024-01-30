import { UserButton } from "@clerk/nextjs";
import { listAssistants } from "@/actions";
import { currentUser } from "@clerk/nextjs/server";
import Assistants from "@/components/assistants";
import { permanentRedirect } from "next/navigation";
import { AssistantMetadata } from "@/types";
import Link from "next/link"

export default async function Home() {
  const { success: assistantsRetrieved, assistants } = await listAssistants();
  if (!assistantsRetrieved || !assistants) {
    return <p>Problem loading assistants.</p>;
  }

  const topics = assistants.map(({ id, metadata }) => {
    const { duty: topic, chalk: color } = metadata as AssistantMetadata
    return { topic, color, id }
  })

  const user = await currentUser()
  if (!user) {
    permanentRedirect("/sign-in")
  }

  return (
    <div>
      <Navbar />
      <Assistants assistants={assistants} />
      <h1 className="text-xl">Hello, {user.firstName}. What would you like to talk about?</h1>
      <ul className="flex gap-2">
        {topics.map(({ topic, color, id }) => (
          <Link className="hover:underline" href={"/assistant/" + id} key={id} style={{ color, backgroundColor: topic === "filmmaking" ? "black" : "white" }}>{topic}</Link>
        ))}
      </ul>
    </div>
  );
}

function Navbar() {
  return (
    <div className="flex justify-between py-2">
      <h1 className="font-bold">Aiamano</h1>
      <ul className="flex gap-2">
        <UserButton afterSignOutUrl="/" />
      </ul>
    </div>
  );
}
