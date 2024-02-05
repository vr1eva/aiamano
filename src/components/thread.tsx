"use client";
import { submitForm } from "@/actions";
import Image from "next/image";
import {
  MessageArgs,
  ThreadArgs,
  MessageAvatarArgs,
  MessageContentArgs,
} from "@/types";
import { ThreadMessage } from "openai/resources/beta/threads/messages/messages";
import { useOptimisticThreadMessages } from "@/hooks/useOptimisticThreadMessages";
import Form from "@/components/form";

export default function Thread({
  threadId,
  assistantId,
  messages,
  participants,
}: ThreadArgs) {
  const { optimisticMessages, addOptimisticMessage } =
    useOptimisticThreadMessages({
      initialMessages: messages,
    });
  return (
    <>
      <ul className="flex flex-col gap-4 min-h-screen">
        {optimisticMessages.map((message: ThreadMessage) => (
          <Message
            avatar={
              message.role === "user"
                ? participants.user.avatar
                : participants.assistant.avatar
            }
            key={message.id}
            message={message}
          />
        ))}
      </ul>
      <Form
        handleSubmit={submitForm}
        assistantId={assistantId}
        threadId={threadId}
        addOptimisticMessage={addOptimisticMessage}
      />
    </>
  );
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
  return <p className="font-bold">{role === "user" ? "You" : "Assistant"}</p>;
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
