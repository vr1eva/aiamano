import { UserButton } from "@clerk/nextjs";
import { listAssistants } from "@/actions";
import Assistants from "@/components/assistants";
import { AssistantMetadata } from "@/types";
import Link from "next/link"
import Topics from "@/components/topics"

export default async function Home() {
  const { success: assistantsRetrieved, assistants } = await listAssistants();
  if (!assistantsRetrieved || !assistants) {
    return <p>Problem loading assistants.</p>;
  }

  const topics = assistants.map(({ id: assistantId, metadata }) => {
    const { duty: name, chalk: color } = metadata as AssistantMetadata
    return { name, color, assistantId }
  })


  return (
    <div>
      <Navbar />
      <Topics topics={topics} />
      <Assistants assistants={assistants} />
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
