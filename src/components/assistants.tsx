import { Assistant } from "openai/resources/beta/assistants/assistants";
import AssistantLink from "@/components/assistant"
import { listAssistants } from "@/actions";

export default async function Assistants() {
  const { success: assistantsRetrieved, assistants } = await listAssistants();
  if (!assistantsRetrieved || !assistants) {
    return <p>Problem loading assistants.</p>;
  }
  return (
    <ul className="flex gap-2 mb-4">
      {assistants.map((assistant: Assistant) => {
        return (
          <AssistantLink key={assistant.id} assistant={assistant} />
        )
      })}
    </ul>
  );
}


