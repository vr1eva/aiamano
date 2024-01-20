"use server";
import { auth, clerkClient, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ConversationWithMessages } from "@/types";
import fs from "fs";
import { openai } from "@/openai";
import { streamToBuffer } from "@/lib/utils";

const schema = z.object({
  prompt: z.string({
    invalid_type_error: "Invalid prompt",
  }),
});

async function createNewConversation(): Promise<ConversationWithMessages> {
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
    return conversation;
  } catch (error) {
    throw new Error("Failed to create conversation");
  }
}

export async function submitForm(formData: FormData) {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const validatedFields = schema.safeParse({
    prompt: formData.get("prompt"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const conversation = await getConversation();
  if (!conversation || !conversation.messages) {
    return;
  }
  const newMessage = await createMessage({
    content: validatedFields.data.prompt,
    role: "user",
    conversationId: conversation.id,
  });
  const messages = [...conversation.messages, newMessage].map((message) => ({
    role: message?.role,
    content: message?.content,
  }));

  const completion = await complete({ messages });
  console.log(completion);
  await createMessage({
    content: completion.text,
    role: "system",
    conversationId: conversation.id,
  });
  revalidatePath("/chat");
}

interface CreateMessageArgs {
  content: string;
  role: string;
  conversationId: number;
}
async function createMessage({
  content,
  role,
  conversationId,
}: CreateMessageArgs) {
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

  return message ? message : null;
}

export async function getConversation(): Promise<ConversationWithMessages> {
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
        return conversation;
      } else {
        return await createNewConversation();
      }
    } catch (error) {
      throw new Error("Failed to create user conversation");
    }
  } else {
    return await createNewConversation();
  }
}

export async function transcribe(base64Audio) {
  const { userId } = auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const user = await currentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Convert the base64 audio data to a Buffer
  const audioBuffer = Buffer.from(base64Audio, "base64");

  // Define the file path for storing the temporary WAV file
  const filePath = "tmp/input.wav";

  try {
    // Write the audio data to a temporary WAV file synchronously
    fs.writeFileSync(filePath, audioBuffer);

    // Create a readable stream from the temporary WAV file
    const readStream = fs.createReadStream(filePath);

    const transcript = await openai.audio.transcriptions.create({
      file: readStream,
      model: "whisper-1",
      prompt: "I'm saying hello world with my microphone.",
    });

    const conversation = await getConversation();

    if (!conversation) {
      return new Response("Unauthorized", { status: 401 });
    }

    const messages = [
      ...conversation.messages,
      { role: "user", content: transcript.text },
    ].map((message) => ({
      role: message?.role,
      content: message?.content,
    }));

    const { completion } = await complete({ messages });

    const { systemAudio } = await textToSpeech({ input: completion });

    console.log(systemAudio);

    // Remove the temporary file after successful processing
    // fs.unlinkSync(filePath);
    return { transcript, completion, speech };
  } catch (error) {
    console.error("Error processing audio:", error);
    return Response.json({ systemAudio: "SOrry" });
  }
}

export async function textToSpeech({ input }) {
  console.log(input);
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input,
  });

  const readableStream = mp3.body as unknown as NodeJS.ReadableStream;
  const { id: conversationId } = await getConversation();
  const buffer = await streamToBuffer(readableStream);
  const savedAudio = await prisma.message.create({
    data: {
      audio: {
        create: {
          content: buffer,
        },
      },
      conversationId,
      role: "system",
      content:
        "You are Oliver Tree Nickell (born June 29, 1993) is an American musician. Born in Santa Cruz, California.",
    },
  });
  if (savedAudio) {
    return { systemAudio: savedAudio };
  } else {
    return { error: true };
  }
}

export async function complete({ messages }) {
  try {
    const completion = await openai.chat.completions.create({
      messages,
      model: "gpt-3.5-turbo",
    });

    return { completion: completion.choices[0].message.content };
  } catch (error) {
    throw new Error("Failed to create completion.");
  }
}
