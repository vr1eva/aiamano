"use client"
import Link from "next/link";
import { Assistant } from "openai/resources/beta/assistants/assistants";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AssistantMetadata } from "@/types";

export default function Assistant({ assistant }: { assistant: Assistant }) {
    const pathname = usePathname()
    const { avatarUrl } = assistant.metadata as AssistantMetadata;
    return (
        <Link className={`${pathname === '/assistant/' + assistant.id ? 'border-solid border-2 border-indigo-600' : ''}`} href={"/assistant/" + assistant.id}>
            <li className="hover:border-dotted" key={assistant.id}>
                <Image
                    className="rounded-full"
                    src={avatarUrl}
                    width={64}
                    height={64}
                    alt="Assistant avatar"
                />
                <p className="text-center text-xs">{assistant.name}</p>
            </li>
        </Link>
    );
}
