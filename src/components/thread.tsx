import Image from "next/image";
import {
  OptimisticThreadMessage,
  ThreadMessageContent,
  THREAD_MESSAGES_OFFSET,
  MessageArgs,
  ROLE_ENUM,
  ThreadArgs,
} from "@/types";
import Link from "next/link";

export default function Thread({
  messages,
  userAvatar,
  systemAvatar = "/tree.png",
  separatorRef,
}: ThreadArgs) {
  return (
    <ul className="flex flex-col gap-4 min-h-screen">
      {messages
        .slice(1 as THREAD_MESSAGES_OFFSET)
        .map((message: OptimisticThreadMessage, key: number) => (
          <Message
            avatarUrl={message.role === "user" ? userAvatar : systemAvatar}
            key={key}
            message={message}
          />
        ))}
      <small ref={separatorRef}></small>
    </ul>
  );
}

function MessageAvatar({ avatarUrl }: { avatarUrl: string }) {
  return (
    <Image
      className="rounded-full object-cover"
      src={avatarUrl}
      alt={"Message author avatar"}
      height={32}
      width={32}
    />
  );
}

function MessageAuthor({ role }: { role: string }) {
  return <p className="font-bold">{role === "user" ? "You" : "System"}</p>;
}

function MessageContent({ content }: { content: ThreadMessageContent }) {
  if (!content) {
    return null;
  }
  if (content.type === "text") {
    return <p>{content.text.value}</p>;
  } else if (content.type === "image_file" && content.image_file?.file_id) {
    return <Image src={content.image_file.file_id} alt="content image" />;
  }
  return null;
}

function Message({ message, avatarUrl }: MessageArgs) {
  return (
    <li className="flex items-start gap-4">
      <MessageAvatar avatarUrl={avatarUrl} />
      <div className="flex flex-col">
        <MessageAuthor role={message.role} />
        <MessageContent content={message.content[0]} />
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

function MessageAudioLink({
  role,
  message,
}: {
  role: ROLE_ENUM;
  message: MessageWithAudio;
}) {
  if (!message || !message.audio) {
    return null;
  }
  if (role === "system") {
    return (
      <Link
        className="flex items-center mt-2"
        href={"/audios/" + message.audio.id}
        scroll={false}
      >
        <Image width={24} height={24} src="/play.svg" alt="play circle" />
        <p className="font-extralight">Listen</p>
      </Link>
    );
  }
}
