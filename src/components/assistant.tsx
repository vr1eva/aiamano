"use client"
import Link from "next/link";
import { Assistant } from "openai/resources/beta/assistants/assistants";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AssistantMetadata } from "@/types";

export default function Assistant({ assistant }: { assistant: Assistant }) {
    const pathname = usePathname()
    const { avatarUrl, duty } = assistant.metadata as AssistantMetadata;
    return (
        <div >
            <Link href={"/assistant/" + assistant.id} className="flex flex-col items-center hover:bg-slate-100 p-2 space-y-1.5">
                <span className="text-center text-slate-600 font-semibold  text-xs mt-1">{assistant.name}</span>
                <li className="border-4 rounded-full shadow-md" style={{ borderColor: pathname === '/assistant/' + assistant.id ? "#dee50d" : "#e7e7e778" }} key={assistant.id}>
                    <Image
                        className="rounded-full"
                        src={avatarUrl}
                        width={64}
                        height={64}
                        alt="Assistant avatar"
                    />
                </li>
                <span className="text-xs text-slate-400 ">#{duty}</span>

            </Link>
        </div>
    );
}

