import Image from "next/image";
import {
    ConversationWithOptimisticMessages,
    OptimisticMessage,
    CONVERSATION_OFFSET,
    MessageArgs
} from "@/types";
import Link from 'next/link'

export default function Conversation({
    conversation,
    userAvatar,
    systemAvatar = "/tree.png",
    separatorRef,
}: {
    conversation: ConversationWithOptimisticMessages;
    userAvatar: string;
    systemAvatar?: string;
    separatorRef: React.RefObject<HTMLElement> | null;
}) {
    return (
        <ul className="flex flex-col gap-2 min-h-screen">
            {conversation.messages
                .slice(1 as CONVERSATION_OFFSET)
                .map((message: OptimisticMessage, key) =>
                (
                    <Message avatar={message.role === "user" ? userAvatar : systemAvatar} key={key} message={message} />
                )
                )}
            <small ref={separatorRef}></small>
        </ul>
    );
}


function Message({
    message,
    avatar,
}: MessageArgs) {
    return (
        <>
            <li className="flex items-start gap-4">
                <Image
                    className="rounded-full object-cover"
                    src={avatar}
                    alt={message.role + " avatar"}
                    height={32}
                    width={32}
                />
                <div className="flex flex-col">
                    <p className="font-bold">{message.role === "user" ? "You" : "System"}</p>
                    <p>{message.content}</p>
                    <MessageActions role={message.role} />
                    {message.audio ? <Link href={`/audios/${message.audio.id}`} passHref>Play audio</Link> : null}
                </div>
            </li>
        </>
    );
}

function MessageActions({ role }: { role: string }) {
    if (role === "system") {
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
    } else if (role === "user") {
        <ul className="flex gap-2 opacity-0 hover:opacity-100 cursor-pointer items-center">
            <MessageActionItem>
                <Image src="/edit.svg" width={16} height={16} alt="edit prompt" />
            </MessageActionItem>
        </ul>
    }
}

function MessageActionItem({ children }: { children: React.ReactNode }) {
    return (
        <li className="p-2 hover:bg-gradient-to-r from-zinc-200 to-zinc-300 rounded">
            {children}
        </li>
    );
}