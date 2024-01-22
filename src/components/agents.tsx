import { Agent } from "@/types"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default function Agents({ agents, selectAgent, currentAgent }: { agents: Agent[], selectAgent: Function, currentAgent: Agent }) {

    return (
        <ul className="flex gap-2 mb-20">
            {agents.map(agent => (
                <Agent selected={currentAgent.id === agent.id} agent={agent} key={agent.id} onAgentClick={selectAgent} />
            ))}
        </ul>
    )
}


function Agent({ agent, selected, onAgentClick }: { agent: Agent, selected: boolean, onAgentClick: Function }) {
    const selectedAgentClassname = "border-dashed border-2 border-indigo-600"

    return (
        <li className={cn("hover:border-dotted", selected && selectedAgentClassname)} onClick={() => {
            onAgentClick(agent)
        }}>
            <Image className="rounded-full" src={agent.agentAvatar} width={128} height={128} alt="agent avatar" />
            <p className="text-center">{agent.handle}</p>
        </li>
    )
}