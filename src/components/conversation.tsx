import Image from "next/image"
import { ConversationWithOptimisticMessages, OptimisticMessage } from "@/types"

export default function Conversation({ conversation, userAvatar, systemAvatar = "/tree.png", separatorRef }: { conversation: ConversationWithOptimisticMessages, userAvatar: string, systemAvatar?: string, separatorRef: React.RefObject<HTMLElement> | null }) {

    return (
        <ul className="flex flex-col gap-2 min-h-screen">
            {conversation.messages
                .slice(1)
                .map((message: OptimisticMessage, key) =>
                    message.role === "user" ? (
                        <UserMessage
                            userAvatar={userAvatar}
                            key={key}
                            message={message}
                        />
                    ) : (
                        <SystemMessage systemAvatar={systemAvatar} key={key} message={message} />
                    )
                )}
            <small ref={separatorRef}></small>
        </ul>
    )
}


function SystemMessage({ message, systemAvatar }: { message: OptimisticMessage, systemAvatar: string }) {
    return (
        <li className="flex items-start gap-4">
            <Image
                className="rounded-full object-cover"
                src={systemAvatar}
                alt="system avatar"
                height={32}
                width={32}
            />
            <div className="flex flex-col">
                <p className="font-bold">System</p>
                <p>{message.content}</p>
                <SystemMessageActions />
            </div>
        </li>
    );
}

function SystemMessageActions() {
    return (
        <ul className="flex gap-2 opacity-0 hover:opacity-100 cursor-pointer items-center">
            <MessageActionItem>
                <Image
                    src="/copy.svg"
                    width={16}
                    height={16}
                    alt="copy answer to clipboard button"
                />
            </MessageActionItem>
            <MessageActionItem>
                <Image src="/like.svg" width={16} height={16} alt="like answer" />
            </MessageActionItem>
            <MessageActionItem>
                <Image
                    src="/downvote.svg"
                    width={16}
                    height={16}
                    alt="downvote answer"
                />
            </MessageActionItem>
        </ul>
    );
}

function MessageActionItem({ children }: { children: React.ReactNode }) {
    return (
        <li className="p-2 hover:bg-gradient-to-r from-zinc-200 to-zinc-300 rounded">
            {children}
        </li>
    );
}


function UserMessageActions() {
    return (
        <ul className="flex gap-2 opacity-0 hover:opacity-100 cursor-pointer items-center">
            <MessageActionItem>
                <Image src="/edit.svg" width={16} height={16} alt="edit prompt" />
            </MessageActionItem>
        </ul>
    );
}



function UserMessage({
    message,
    userAvatar,
}: {
    message: OptimisticMessage;
    userAvatar: string;
}) {
    return (
        <li className="flex items-start gap-4">
            <Image
                className="rounded-full object-cover"
                src={userAvatar}
                alt="user avatar"
                height={32}
                width={32}
            />
            <div className="flex flex-col">
                <p className="font-bold">You</p>
                <p>{message.content}</p>
                <UserMessageActions />
            </div>
        </li>
    );
}