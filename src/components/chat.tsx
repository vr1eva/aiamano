"use client";
import { Input } from "@/components/ui/input";
import React, { useRef, useEffect } from "react";
import { submitForm } from "@/actions";
import { Button } from "@/components/ui/button";
import { Microphone } from "@/components/microphone";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import Conversation from "@/components/conversation";
import { ChatArgs } from "@/types";
import { useOptimisticConversation } from "@/hooks/useOptimisticConversation";
import { scrollUntilElementIsVisible } from "@/lib/utils";

export function Chat({ conversation, userAvatar }: ChatArgs) {
  const { optimisticConversation, addOptimisticMessage } =
    useOptimisticConversation({ initialConversation: conversation });
  const separatorRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    console.log(optimisticConversation.messages);
    scrollUntilElementIsVisible({ ref: separatorRef });
  }, [optimisticConversation.messages]);
  return (
    <>
      <Conversation
        separatorRef={separatorRef}
        conversation={optimisticConversation}
        userAvatar={userAvatar}
      />
      <form
        action={async (formData: FormData) => {
          const [prompt, promptIsValid] = [
            formData.get("prompt") as string,
            formData.get("prompt") !== "",
          ];
          if (!promptIsValid || !prompt) {
            return {
              success: false,
            };
          }
          addOptimisticMessage({
            role: "user",
            content: prompt,
          });
          await scrollUntilElementIsVisible({ ref: separatorRef });
          await submitForm(formData);
        }}
        className="flex flex-col space-x-2 w-full  mt-[2.25rem] pb-8 bg-white sticky bottom-0"
      >
        <Entry
          addOptimisticMessage={addOptimisticMessage}
          scrollToLastMessage={() => {
            scrollUntilElementIsVisible({ ref: separatorRef });
          }}
        />
      </form>
    </>
  );
}

export function Entry({
  addOptimisticMessage,
  scrollToLastMessage,
}: {
  addOptimisticMessage: Function;
  scrollToLastMessage: Function;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (inputRef.current && pending) {
      inputRef.current.value = "";
    } else {
      inputRef.current?.focus;
    }
  }, [pending]);

  return (
    <>
      <Microphone
        addOptimisticTranscript={addOptimisticMessage}
        scrollToLastMessage={scrollToLastMessage}
        occupied={pending}
      />
      <Input disabled={pending} ref={inputRef} type="text" name="prompt" />
      <Button variant="chat" type="submit" aria-disabled={pending}>
        <Image src="/send.svg" width={16} height={16} alt="submit button" />
      </Button>
    </>
  );
}
