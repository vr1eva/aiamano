"use client";
import { Input } from "@/components/ui/input";
import React, { useRef, useState } from "react";
import { submitForm } from "@/actions";
import { Button } from "@/components/ui/button";
import { Microphone } from "@/components/microphone";
import Image from "next/image";

export function Form() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSending(true);
    await submitForm(formData);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setSending(false);
  }

  return (
    <>
      <Microphone />
      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-x-2 relative w-full items-center mt-[2.25rem] pb-8 bg-white"
      >
        <Input disabled={sending} ref={inputRef} type="text" name="prompt" />
        <Button variant="chat" type="submit">
          <Image src="/send.svg" width={16} height={16} alt="submit button" />
        </Button>
      </form>
    </>
  );
}
