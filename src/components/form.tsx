"use client";
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from "uuid"
import React, { useRef, } from "react";
import { submitForm } from "@/actions";
import { Button } from "@/components/ui/button";
// import { Microphone } from "@/components/microphone";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import { OptimisticThreadMessage, FormArgs } from "@/types";

export default function Form({
  addOptimisticMessage,
  threadId,
  assistantId
}: FormArgs) {
  const { pending } = useFormStatus();
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
      id: uuidv4(),
      file_ids: [],
      metadata: {},
      object: "thread.message",
      run_id: uuidv4(),
      thread_id: threadId,
      created_at: 1,
      assistant_id: assistantId,
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


  return (
    <form
      action={handleSubmit}
      className="flex flex-col space-x-2 w-full  mt-[2.25rem] pb-8 bg-white sticky bottom-0"
    >
      <Input
        disabled={pending}
        ref={inputRef}
        type="text"
        name="prompt"
      />
      <Button variant="chat" type="submit" aria-disabled={pending}>
        <Image src="/send.svg" width={12} height={12} alt="submit button" />
      </Button>
      <input name="threadId" defaultValue={threadId} hidden />
      <input name="assistantId" defaultValue={assistantId} hidden />
    </form>
  );
}
