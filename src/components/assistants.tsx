import Image from "next/image";
import { Assistant } from "openai/resources/beta/assistants/assistants";
import { AssistantMetadata } from "@/types";
import Link from "next/link";

export default async function Assistants({
  assistants,
}: {
  assistants: Assistant[];
}) {
  console.log("assistants", assistants);
  return (
    <ul className="flex gap-2 mb-20">
      {assistants.map((assistant: Assistant) => {
        return <Assistant key={assistant.id} assistant={assistant} />;
      })}
    </ul>
  );
}
export async function Assistant({ assistant }: { assistant: Assistant }) {
  const { avatarUrl } = assistant.metadata as AssistantMetadata;
  return (
    <Link href={"/assistant/" + assistant.id}>
      <li className="hover:border-dotted" key={assistant.id}>
        <Image
          className="rounded-full"
          src={avatarUrl}
          width={128}
          height={128}
          alt="Assistant avatar"
        />
        <p className="text-center">{assistant.name}</p>
      </li>
    </Link>
  );
}
