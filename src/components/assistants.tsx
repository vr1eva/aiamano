import Image from "next/image"
import { Assistant } from "openai/resources/beta/assistants/assistants"
import { AssistantMetadata } from "@/types"

export default function Assistants({ assistants }: { assistants: Assistant[] }) {

    return (
        <ul className="flex gap-2 mb-20">
            {assistants.map(assistant => (
                <li className="hover:border-dotted" >
                    {assistant.metadata ? <Image className="rounded-full" src={assistant.metadata.avatarUrl ? "" : null} width={128} height={128} alt="Assistant avatar" /> : null}
                    <p className="text-center">{assistant.name}</p>
                </li>
            ))
            }
        </ul >
    )
}


function Assistant({ assistant, selected, onAssistantClick }: { assistant: Assistant, selected: boolean, onAssistantClick: Function }) {
    const selectedAssistantClassname = "border-dashed border-2 border-indigo-600"

    return (
       
    )
}