"use client";
import { Input } from "@/components/ui/input";
import React, { useRef, useEffect, useState } from "react";
import { submitForm } from "@/actions";
import { Button } from "@/components/ui/button";
import { Microphone } from "@/components/microphone";
import Image from "next/image"
import { useFormStatus } from 'react-dom'
import Conversation from "@/components/conversation"
import { ChatArgs } from "@/types";
import { useOptimisticConversation } from "@/hooks/useOptimisticConversation"


export function Chat({ conversation, userAvatar }: ChatArgs) {
  const { optimisticConversation, addOptimisticMessage } = useOptimisticConversation({ initialConversation: conversation })

  return (
    <>
      <Conversation conversation={optimisticConversation} userAvatar={userAvatar} />
      <Microphone />
      <form
        action={async (formData: FormData) => {
          const [prompt, promptIsValid] = [formData.get("prompt"), formData.get("prompt") !== ""]
          if (!promptIsValid || !prompt) {
            return {
              success: false
            }
          }
          addOptimisticMessage({
            role: "user",
            content: prompt,
          })
          await submitForm(formData)
        }}
        className="flex flex-col space-x-2 w-full items-center mt-[2.25rem] pb-8 bg-white sticky bottom-0"
      >
        <Entry />
      </form>
    </>
  );
}

export function Entry() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [lastPrompt, setPrompt] = useState("")
  const { pending } = useFormStatus()

  useEffect(() => {
    if (inputRef.current && pending) {
      setPrompt(inputRef.current.value)
      inputRef.current.value = ""
    } else if (lastPrompt && !pending) {
      setPrompt("")
    }
  }, [pending])

  return (
    <>
      {pending ? <p>Sending... <i>{lastPrompt}</i></p> : null}
      <Input disabled={pending} ref={inputRef} type="text" name="prompt" />
      <Button variant="chat" type="submit" aria-disabled={pending}>
        <Image src="/send.svg" width={16} height={16} alt="submit button" />
      </Button>
    </>
  )
}










