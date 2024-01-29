"use client";
import { Input } from "@/components/ui/input";
import React, { useRef, } from "react";
import { submitForm } from "@/actions";
import { Button } from "@/components/ui/button";
import { Microphone } from "@/components/microphone";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import { OptimisticThreadMessage } from "@/types";
import { useRecordVoice } from "@/hooks/useRecordVoice";

export function Form({
  addOptimisticMessage,
}: {
  addOptimisticMessage: Function;
}) {

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
    } as OptimisticThreadMessage);
    await submitForm(formData);
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current?.focus;
    }
  }
  const { startRecording, stopRecording, recording, transcript, processing } =
    useRecordVoice();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { pending } = useFormStatus();

  return (
    <form
      action={handleSubmit}
      className="flex flex-col space-x-2 w-full  mt-[2.25rem] pb-8 bg-white sticky bottom-0"
    >
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
    </form>
  );
}
