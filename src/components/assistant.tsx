import Image from "next/image"
import { fetchAssistant } from "@/actions"
import { AssistantMetadata } from "@/types"

export default async function Assistant() {
    const { assistant, success: assistantFetched } = await fetchAssistant()
    if (!assistantFetched || !assistant) {
        return <p>Problem fetching assistant.</p>
    }
    const metadata = assistant.metadata as AssistantMetadata
    return (
        <ul className="flex gap-2 mb-20">
            <li className="hover:border-dotted" key={assistant.id}>
                <Image className="rounded-full" src={metadata.avatarUrl} width={128} height={128} alt="Assistant avatar" />
                <p className="text-center">{assistant.name}</p>
            </li>
        </ul >
    )
}

