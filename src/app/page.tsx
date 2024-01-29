import { UserButton } from "@clerk/nextjs";
import { fetchThread, fetchMessages, listAssistants } from "@/actions";
import { currentUser } from "@clerk/nextjs/server";
import Assistants from "@/components/assistants";

export default async function Home() {
  const { success: assistantsRetrieved, assistants } = await listAssistants();
  if (!assistantsRetrieved || !assistants) {
    return <p>Problem loading assistants.</p>;
  }

  return (
    <div>
      <Navbar />
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
