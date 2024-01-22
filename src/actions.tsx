"use server";
import { auth, clerkClient, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ConversationFetchResponse, CreateMessageResponse, CreateMessageArgs, FormSubmissionResponse, CompleteResponse, TranscribeArgs, SendAudioArgs, PrepareConversationResponse, TranscribeResponse, TextToSpeechResponse, CreateAudioMessageArgs, ConversationWithMessages, ROLE_ENUM } from "@/types";
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
  const { message: userMessage, success: userMessageCreated } = await createMessage({
    content: validatedFields.data.prompt,
    role: "user",
  });

  if (!userMessageCreated || !userMessage) {
    return { success: false }
  }
  console.log("Text sent:", userMessage)

  const { conversation, success: conversationFetched } = await getConversation()
  if (!conversationFetched || !conversation || !conversation.messages) {
    return { success: false }
  }

  const { completion: systemText, success: completionFullfilled } = await complete();
  if (!completionFullfilled || !systemText) {
    return { success: false }
  }
  const { message: systemMessage, success: systemMessageCreated } = await createMessage({
    content: systemText,
    role: "system",
  });


  if (!systemMessageCreated || !systemMessage) {
    return {
      success: false
    }
  }
  console.log("Text received:", systemMessage)
  revalidatePath("/")
  return {
    success: true
  }
}

async function createMessage({
  content,
  role,
}: CreateMessageArgs): Promise<CreateMessageResponse> {
  const { conversation, success: conversationFetched } = await getConversation()
  if (!conversationFetched || !conversation) {
    return {
      success: false
    }
  }
  const message = await prisma.message.create({
    data: {
      content,
      role,
      conversation: {
        connect: {
          id: conversation.id,
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
  let result;
  if (!conversationId) {
    const { conversation: newConversation, success: conversationCreated } = await createNewConversation()
    if (!conversationCreated || !newConversation || !newConversation.messages) {
      result = { success: false }
    } else {
      result = { conversation: newConversation, success: true }
    }
  } else {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
      },
      include: {
        messages: true,
      },
    });

    if (!conversation || !conversation.messages) {
      result = { success: false }
    } else {
      result = { conversation, success: true }
    }
  }

  return {
    conversation: result.conversation,
    success: result.success
  }

}

export async function sendAudio({ base64Data }: SendAudioArgs) {
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


  const { transcript, success: transcribedSuccessfully } = await transcribe({ base64Data })

  if (!transcribedSuccessfully || !transcript) {
    return {
      success: false
    }
  }


  const { message: userMessage, success: transcriptSaved } = await createMessage({
    content: transcript,
    role: "user",
  })

  if (!transcriptSaved || !userMessage) {
    return { success: false }
  }

  const { completion: systemText, success: responseReceived } = await complete();

  if (!responseReceived || !systemText) {
    return {
      success: false
    }
  }

  const { speechBuffer, success: speechGenerated } = await textToSpeech({ input: systemText });

  if (!speechGenerated || !speechBuffer) {
    return {
      success: false
    }
  }

  const { audioMessage: systemAudioMessage, success: systemAudioMessageCreated } = await createAudioMessage({ text: systemText, buffer: speechBuffer })

  if (!systemAudioMessageCreated || !systemAudioMessage) {
    return {
      success: false
    }
  }
  revalidatePath("/")
  return {
    transcript,
    success: true
  }
}

export async function transcribe({ base64Data }: TranscribeArgs): Promise<TranscribeResponse> {
  const filePath = "tmp/input.wav";
  const audioBuffer = Buffer.from(base64Data, "base64");
  fs.writeFileSync(filePath, audioBuffer);
  const readStream = fs.createReadStream(filePath);
  const transcript = await openai.audio.transcriptions.create({
    file: readStream,
    model: "whisper-1",
  });

  if (!transcript) {
    return { success: false }
  }

  return {
    transcript: transcript.text, success: true
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

  if (!audioMessage) {
    return { success: false };
  } return { audioMessage, success: true };
}

export async function complete(): Promise<CompleteResponse> {
  const { conversation, success: conversationFetched } = await getConversation()
  if (!conversationFetched || !conversation || !conversation.messages) {
    return {
      success: false
    }
  }
  const { conversation: preparedConversation, success: conversationMessagesFormatted } = await prepareConversationForCompletion({ conversation })
  if (!conversationMessagesFormatted || !preparedConversation || !preparedConversation.messages) {
    return {
      success: false
    }
  }

  const completion = await openai.chat.completions.create({
    messages: preparedConversation.messages,
    model: "gpt-3.5-turbo",
  });

  if (!completion || !completion.choices[0].message.content) {
    return { success: false }
  }

  return { completion: completion.choices[0].message.content, success: true };
}

async function prepareConversationForCompletion({ conversation }: { conversation: ConversationWithMessages }): Promise<PrepareConversationResponse> {
  if (!conversation || !conversation.messages) {
    return { success: false }
  }

  return {
    conversation: {
      ...conversation, messages: conversation.messages.map((message) => ({
        role: message.role as ROLE_ENUM,
        content: message.content,
      }))
    }, success: true
  }
}