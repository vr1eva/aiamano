"use server";
import { auth, clerkClient, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma";
import { z } from "zod";
import { Message } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { ConversationFetchResponse, CreateMessageResponse, CreateMessageArgs, FormSubmissionResponse, CreateCompletionArgs, TranscribeResponse, TextToSpeechResponse, CreateAudioMessageArgs } from "@/types";
import fs from "fs";
import { openai } from "@/openai";
import { streamToBuffer } from "@/lib/utils";

const schema = z.object({
  prompt: z.string({
    invalid_type_error: "Invalid prompt",
  }),
});

async function createNewConversation() {
  const { userId }: { userId: string | null } = auth();
  if (!userId) {
    redirect("/sign-in");
  }
  try {
    const conversation = await prisma.conversation.create({
      data: {
        messages: {
          create: [
            {
              role: "system",
              content:
                "You are Oliver Tree Nickell (born June 29, 1993) is an American musician. Born in Santa Cruz, California.",
            },
          ],
        },
      },
      include: {
        messages: true,
      },
    });
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        conversationId: conversation.id,
      },
    });
    return { conversation, success: true }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function submitForm(formData: FormData): Promise<FormSubmissionResponse> {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const validatedFields = schema.safeParse({
    prompt: formData.get("prompt"),
  });
  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors)
    return {
      success: false
    };
  }
  const { conversation, success: conversationFetched } = await getConversation();
  if (!conversationFetched || !conversation || !conversation.messages) {
    return { success: false }
  } else {
    console.log("Conversation fetched")
  }

  const { message: userMessage, success: userMessageCreated } = await createMessage({
    content: validatedFields.data.prompt,
    role: "user",
    conversationId: conversation.id,
  });

  if (!userMessageCreated || !userMessage) {
    return { success: false }
  }
  console.log("Sending text:", userMessage)
  revalidatePath("/")

  const messages = await parseConversation({ messages: [...conversation.messages, userMessage] })
  const { completion: systemText, success: completionFullfilled } = await complete({ messages });
  if (!completionFullfilled || !systemText) {
    return { success: false }
  }
  const { message: systemMessage, success: systemMessageCreated } = await createMessage({
    content: systemText,
    role: "system",
    conversationId: conversation.id,
  });

  if (!systemMessageCreated || !systemMessage) {
    return {
      success: false
    }
  }
  console.log("Response received from the network:", systemMessage)
  revalidatePath("/");

  return {
    success: true
  }
}

async function createMessage({
  content,
  role,
  conversationId,
}: CreateMessageArgs): Promise<CreateMessageResponse> {
  const message = await prisma.message.create({
    data: {
      content,
      role,
      conversation: {
        connect: {
          id: conversationId,
        },
      },
    },
  });

  if (message) {
    return { message, success: true }
  } else {
    return { success: false }
  }
}

export async function getConversation(): Promise<ConversationFetchResponse> {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const user = await clerkClient.users.getUser(userId);
  const conversationId = Number(user.privateMetadata.conversationId);
  if (conversationId) {
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
        },
        include: {
          messages: true,
        },
      });
      if (conversation && conversation.messages) {
        return { conversation, success: true };
      } else {
        const { conversation, success: conversationCreated } = await createNewConversation()
        if (!conversationCreated || conversation) {
          return {
            success: false
          }
        }
        return { conversation, success: true }
      }
    } catch (error) {
      throw new Error("Failed to create user conversation");
    }
  } else {
    return await createNewConversation();
  }
}

export async function transcribe(base64Audio): Promise<TranscribeResponse> {
  const { userId } = auth();
  if (!userId) {
    return {
      success: false
    }
  }
  const user = await currentUser();
  if (!user) {
    return {
      success: false
    }
  }
  const audioBuffer = Buffer.from(base64Audio, "base64");

  const filePath = "tmp/input.wav";

  try {
    fs.writeFileSync(filePath, audioBuffer);

    const readStream = fs.createReadStream(filePath);

    const transcript = await openai.audio.transcriptions.create({
      file: readStream,
      model: "whisper-1",
    });

    const { conversation, success: conversationFetched } = await getConversation();

    if (!conversationFetched || !conversation) {
      return { success: false }
    }
    const { message: userMessage, success: transcriptSaved } = await createMessage({
      content: transcript.text,
      role: "user",
      conversationId: conversation.id,
    })

    if (!transcriptSaved || !userMessage) {
      return { success: false }
    }
    console.log(transcript)
    revalidatePath("/")

    const messages = await parseConversation({ messages: [...conversation.messages, userMessage] })

    const { completion, success: completionFulfilled } = await complete({ messages });
    if (!completionFulfilled || !completion) {
      return { success: false }
    }
    console.log(completion)
    const { speechBuffer, success: audioBuffered } = await textToSpeech({ input: completion });
    if (!audioBuffered || !speechBuffer) {
      return {
        success: false
      }
    }
    revalidatePath("/")

    const { audioMessage, success: audioMessageCreated } = await createAudioMessage({ text: userMessage.content, buffer: speechBuffer })

    if (!audioMessageCreated || !audioMessage) {
      return {
        success: false
      }
    }
    // Remove the temporary file after successful processing
    // fs.unlinkSync(filePath);
    return { success: true };
  } catch (error) {
    console.error("Error processing audio:", error)
    return { success: false }
  }
}
export async function textToSpeech({ input }: { input: string }): Promise<TextToSpeechResponse> {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input,
  });

  const readableStream = mp3.body as unknown as NodeJS.ReadableStream;
  const speechBuffer = await streamToBuffer(readableStream);
  return { speechBuffer, success: true }
}

async function createAudioMessage({ text, buffer }: CreateAudioMessageArgs) {
  const { conversation, success: conversationFetched } = await getConversation()
  if (!conversationFetched || !conversation) {
    return {
      success: false
    }
  }
  const audioMessage = await prisma.audio.create({
    data: {
      content: buffer,
      message: {
        create: {
          role: "system",
          content: text,
          conversation: {
            connect: {
              id: conversation.id
            }
          }
        }
      }
    },
  });

  if (audioMessage) {
    revalidatePath("/")
    console.log(audioMessage)
    return { audioMessage, success: true };
  } else {
    return { success: false };
  }
}

export async function complete({ messages }: CreateCompletionArgs) {
  if (!messages) {
    return {
      success: false
    }
  }

  const completion = await openai.chat.completions.create({
    messages,
    model: "gpt-3.5-turbo",
  });

  if (!completion) {
    return { success: false }
  }

  return { completion: completion.choices[0].message.content, success: true };
}

async function parseConversation({ messages }: { messages: Message[] }) {
  return messages.map((message) => ({
    role: message?.role,
    content: message?.content,
  }));
}