"use client";
import { revalidatePath } from "next/cache";
import { Input } from "@/components/ui/input";
import React, { useRef, useEffect, useState } from "react";
import { submitForm, fetchMessages } from "@/actions";
import { Button } from "@/components/ui/button";
import { Microphone } from "@/components/microphone";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import Thread from "@/components/thread";
import { ChatArgs, OptimisticThreadMessage } from "@/types";
import { useOptimisticThreadMessages } from "@/hooks/useOptimisticThreadMessages";
import { scrollUntilElementIsVisible } from "@/lib/utils";
import { useRecordVoice } from "@/hooks/useRecordVoice";

export async function Chat({ messages, userAvatar }: ChatArgs) {
  const separatorRef = useRef<HTMLElement | null>(null);
  const { optimisticMessages, addOptimisticMessage } =
    useOptimisticThreadMessages({
      initialMessages: messages,
    });

  useEffect(() => {
    scrollUntilElementIsVisible({ ref: separatorRef });
  }, [messages]);

  async function handleSubmit(formData: FormData) {
    const prompt = formData.get("prompt") as string;
    if (!prompt) {
      return {
        success: false,
      };
    }
    addOptimisticMessage({
      role: "user",
      content: [
        {
          type: "text",
          text: {
            value: prompt,
            annotations: [],
          },
        },
      ],
    });
    await scrollUntilElementIsVisible({ ref: separatorRef });
    const run = await submitForm(formData);
  }

  return (
    <>
      <Thread
        separatorRef={separatorRef}
        messages={optimisticMessages}
        userAvatar={userAvatar}
      />
      <form
        action={handleSubmit}
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
      scrollUntilElementIsVisible({ ref: separatorRef });
    }
  }, [processing, transcript, separatorRef]);

  return (
    <>
      <Microphone
        startRecording={startRecording}
        stopRecording={stopRecording}
        recording={recording}
        transcript={transcript}
        processing={processing}
        addOptimisticTranscript={addOptimisticMessage}
        occupied={pending}
      />
      <Input
        disabled={pending || processing || recording}
        ref={inputRef}
        type="text"
        name="prompt"
      />
      <Button variant="chat" type="submit" aria-disabled={pending}>
        <Image src="/send.svg" width={36} height={36} alt="submit button" />
      </Button>
    </>
  );
}
