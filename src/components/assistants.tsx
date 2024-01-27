import Image from "next/image";
import { listAssistants, fetchAvatar } from "@/actions";
import { Assistant } from "openai/resources/beta/assistants/assistants";
import { AssistantWithMetadata } from "@/types";

export default async function Assistants() {
  const { success: assistantsRetrieved, assistants } = await listAssistants();
  if (!assistantsRetrieved || !assistants) {
    return <p>Problem loading assistants.</p>;
  }

  return (
    <ul className="flex gap-2 mb-20">
      {assistants.data.map((assistant: Assistant) => (
        <Assistant assistant={assistant} />
      ))}
    </ul>
  );
}

export async function Assistant({ assistant }: { assistant: Assistant }) {
  const assistantWithMetadata = {
    ...assistant,
    metadata: { avatar: await fetchAvatar({ openaiId: assistant.id }) },
  } as AssistantWithMetadata;

  if (!assistantWithMetadata.metadata) {
    return <p>There was an error loading the assistant metadata.</p>;
  }
  return (
    <li className="hover:border-dotted" key={assistantWithMetadata.id}>
      <Image
        className="rounded-full"
        src={assistantWithMetadata.metadata.avatarUrl}
        width={128}
        height={128}
        alt="Assistant avatar"
      />
      <p className="text-center">{assistant.name}</p>
    </li>
  );
}
