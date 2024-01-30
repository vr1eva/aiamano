"use client";
import { Input } from "@/components/ui/input";
import React, { useRef, } from "react";
import { submitForm } from "@/actions";
import { Button } from "@/components/ui/button";
import { Microphone } from "@/components/microphone";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import { OptimisticThreadMessage, FormArgs } from "@/types";
import { useRecordVoice } from "@/hooks/useRecordVoice";
import { revalidatePath } from "next/cache";

export default function Form({
  addOptimisticMessage,
  threadId,
  assistantId
}: FormArgs) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  async function handleSubmit(formData: FormData) {
    const [prompt, assistantId, threadId] = [formData.get("prompt") as string, formData.get("assistantId") as string, formData.get("threadId") as string]
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current?.focus;
    }
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
    const { run, success: runCompleted } = await submitForm({ prompt, assistantId, threadId });
    if (!runCompleted || !run) {
      return { success: false }
    }

  }
  const { startRecording, stopRecording, recording, transcript, processing } =
    useRecordVoice();
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
      <input name="threadId" defaultValue={threadId} hidden />
      <input name="assistantId" defaultValue={assistantId} hidden />
    </form>
  );
}
