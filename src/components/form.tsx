"use client"
import { Input } from "@/components/ui/input";
import React, { useRef, } from "react";
import { submitForm } from "@/actions";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import { FormArgs } from "@/types";

export default function Form({
  addOptimisticMessage,
  threadId,
  assistantId
}: FormArgs) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <form
      action={async (formData: FormData) => {
        const [prompt, assistantId, threadId] = [formData.get("prompt") as string, formData.get("assistantId") as string, formData.get("threadId") as string]
        if (inputRef.current) {
          inputRef.current.value = "";
          inputRef.current?.focus;
        }
        addOptimisticMessage({
          id: "temp.id",
          file_ids: [],
          metadata: {},
          object: "thread.message",
          run_id: null,
          thread_id: threadId,
          created_at: 1,
          assistant_id: null,
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
        })
        await submitForm({ prompt, assistantId, threadId });
      }}
      className="flex flex-col space-x-2 w-full  mt-[2.25rem] pb-8 bg-white sticky bottom-0"
    >
      <Input
        ref={inputRef}
        type="text"
        name="prompt"
        placeholder="Say something..."
      />
      <SubmitButton />
      <input name="threadId" defaultValue={threadId} hidden />
      <input name="assistantId" defaultValue={assistantId} hidden />
    </form>
  );
}

function SubmitButton() {
  const status = useFormStatus();
  return <Button variant="chat" type="submit" disabled={status.pending}>
    <Image src="/send.svg" width={12} height={12} alt="submit button" />
  </Button>
}
