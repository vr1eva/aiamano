import Image from "next/image";
import {
  OptimisticThreadMessage,
  ThreadMessageContent,
  THREAD_MESSAGES_OFFSET,
  MessageArgs,
  ROLE_ENUM,
  ThreadArgs,
  MessageAvatarArgs,
  MessageContentArgs,
} from "@/types";
import Link from "next/link";
import { ThreadMessage } from "openai/resources/beta/threads/messages/messages";

export default async function Thread({
  messages,
  userAvatar,
  systemAvatar = "/tree.png",
  separatorRef,
}: ThreadArgs) {
  return (
    <ul className="flex flex-col gap-4 min-h-screen">
      {messages
        .slice(1 as THREAD_MESSAGES_OFFSET)
        .map((message: ThreadMessage, key: number) => (
          <Message
            avatar={message.role === "user" ? userAvatar : systemAvatar}
            key={key}
            message={message}
          />
        ))}
      <small ref={separatorRef}></small>
    </ul>
  );
}

async function MessageAvatar({ avatar }: MessageAvatarArgs) {
  return (
    <Image
      className="rounded-full object-cover"
      src={avatar}
      alt={"Message author avatar"}
      height={32}
      width={32}
    />
  );
}

function MessageAuthor({ role }: { role: string }) {
  return <p className="font-bold">{role === "user" ? "You" : "System"}</p>;
}

function MessageContent({ content: [contentMessage] }: MessageContentArgs) {
  if (!contentMessage) {
    return null;
  }
  if (contentMessage.type === "text") {
    return <p>{contentMessage.text.value}</p>;
  } else if (
    contentMessage.type === "image_file" &&
    contentMessage.image_file?.file_id
  ) {
    return (
      <Image src={contentMessage.image_file.file_id} alt="content image" />
    );
  }
  return null;
}

async function Message({ message, avatar }: MessageArgs) {
  return (
    <li className="flex items-start gap-4">
      <MessageAvatar avatar={avatar} />
      <div className="flex flex-col">
        <MessageAuthor role={message.role} />
        <MessageContent content={message.content} />
      </div>
    </li>
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
    </ul>;
  }
}

function MessageActionItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="p-2 hover:bg-gradient-to-r from-zinc-200 to-zinc-300 rounded">
      {children}
    </li>
  );
}
