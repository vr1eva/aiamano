"use client"
import {Input} from "@/components/ui/input"
import React, { useRef, useState } from "react";
import { submitForm} from "@/actions"
import {Button} from "@/components/ui/button"


export function Form() {
    const inputRef =  useRef<HTMLInputElement | null>(null)
    const [sending, setSending] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget);
        setSending(true)
        await submitForm(formData)
        if(inputRef.current) {
          inputRef.current.value = ""
      }
      setSending(false)

    }

    return (
      <>
      <form onSubmit={handleSubmit}  >
        <Input disabled={sending} ref={inputRef} type="text" name="prompt" />
        {sending? <p>Loading...</p>: null }
        <Button type="submit" >
        Send
      </Button>
      </form>
      </>
    )
  }
