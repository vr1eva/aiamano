"use client";
import { Input } from "@/components/ui/input";
import React, { useRef, useEffect } from "react";
import { submitForm } from "@/actions";
import { Button } from "@/components/ui/button";
import { Microphone } from "@/components/microphone";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import Conversation from "@/components/thread";
import { ChatArgs } from "@/types";
import { useOptimisticMessages } from "@/hooks/useOptimisticThreadMessages";
import { scrollUntilElementIsVisible } from "@/lib/utils";
import { useRecordVoice } from "@/hooks/useRecordVoice";

export function Chat({ thread, messages, userAvatar }: ChatArgs) {
  const { optimisticMessages, addOptimisticMessage } =
    useOptimisticMessages({ initialMessages: messages });
  const separatorRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    scrollUntilElementIsVisible({ ref: separatorRef });
  }, [optimisticThread.messages]);

  return (
    <>
      <Conversation
        separatorRef={separatorRef}
        messages={optimisticMessages}
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
          separatorRef={separatorRef}
        />
      </form>
    </>
  );
}

export function Entry({
  addOptimisticMessage,
  separatorRef,
}: {
  addOptimisticMessage: Function;
  separatorRef: React.RefObject<HTMLElement>;
}) {
  const { startRecording, stopRecording, recording, transcript, processing } =
    useRecordVoice();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (inputRef.current && pending) {
      inputRef.current.value = "";
    } else {
      inputRef.current?.focus;
    }
  }, [pending]);

  useEffect(() => {
    if (!processing && transcript) {
      scrollUntilElementIsVisible({ ref: separatorRef })
    }
  }, [processing, transcript, separatorRef]);

  return (
    <>
      <Microphone
        startRecording={startRecording} stopRecording={stopRecording} recording={recording} transcript={transcript} processing={processing}
        addOptimisticTranscript={addOptimisticMessage}
        occupied={pending}
      />
      <Input disabled={pending || processing || recording} ref={inputRef} type="text" name="prompt" />
      <Button variant="chat" type="submit" aria-disabled={pending}>
        <Image src="/send.svg" width={36} height={36} alt="submit button" />
      </Button>
    </>
  );
}
