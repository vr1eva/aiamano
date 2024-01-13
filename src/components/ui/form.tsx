"use client"
import {Input} from "@/components/ui/input"
import React, { useRef } from "react";
import { submitForm} from "@/actions"
import {Button} from "@/components/ui/button"


export function Form() {
    const inputRef =  useRef<HTMLInputElement | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget);
        if(inputRef.current) {
            inputRef.current.value = ""
        }
        await submitForm(formData)
    }

    return (
      <>
      <form onSubmit={handleSubmit}  >
        <Input ref={inputRef} type="text" name="prompt" />
        <Button type="submit" >
        Send
      </Button>
      </form>
      </>
    )
  }
