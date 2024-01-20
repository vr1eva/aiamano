import { Form } from "@/components/ui/form";
import { Message } from "@prisma/client";
import { currentUser } from "@clerk/nextjs";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ConversationWithMessages } from "@/types";

export async function Chat({
  conversation,
}: {
  conversation: ConversationWithMessages;
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  return (
    <>
      <ul className="flex flex-col gap-2 h-screen">
        {conversation.messages
          .slice(1)
          .map((message: Message) =>
            message.role === "user" ? (
              <UserMessage
                userImageUrl={user.imageUrl}
                key={message.id}
                message={message}
              />
            ) : (
              <SystemMessage key={message.id} message={message} />
            )
          )}
      </ul>
      <div className="sticky bottom-0">
        <Form />
      </div>
    </>
  );
}

function SystemMessage({ message }: { message: Message }) {
  return (
    <li className="flex items-start gap-4">
      <Image
        className="rounded-full object-cover"
        src="/tree.png"
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
  userImageUrl,
}: {
  message: Message;
  userImageUrl: string;
}) {
  return (
    <li className="flex items-start gap-4">
      <Image
        className="rounded-full object-cover"
        src={userImageUrl}
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
