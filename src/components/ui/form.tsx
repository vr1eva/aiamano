"use client"
import {Input} from "@/components/ui/input"
import React, { useRef } from "react";
import { submitForm} from "@/actions"
import { useFormStatus } from 'react-dom'
import {Button} from "@/components/ui/button"

export function Form() {
    const { pending } = useFormStatus()
    const inputRef =  useRef<HTMLInputElement | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget);

        await submitForm(formData)
        if(inputRef.current) {
            inputRef.current.value = ""
        }
    }

    return (
      <>
      <form onSubmit={handleSubmit}  >
        <Input ref={inputRef} type="text" name="prompt" />
        <Button type="submit" aria-disabled={pending} >
        Send
      </Button>
      </form>
      </>
    )
  }