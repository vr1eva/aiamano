"use client";
import { Input } from "@/components/ui/input";
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import { FormArgs } from "@/types";

export default function Form({
  addOptimisticMessage,
  handleSubmit,
  threadId,
  assistantId,
}: FormArgs) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <form
      action={handleSubmit}
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
  return (
    <Button variant="chat" type="submit" disabled={status.pending}>
      <Image src="/send.svg" width={12} height={12} alt="submit button" />
    </Button>
  );
}
