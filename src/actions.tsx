"use server";
import { PrismaClient } from "@prisma/client";
import { auth, clerkClient } from "@clerk/nextjs";
import { redirect } from "next/navigation";
const prisma = new PrismaClient();
import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z.object({
  prompt: z.string({
    invalid_type_error: "Invalid prompt",
  }),
});

async function createNewConversation(userId: string) {
  const newConversation = await prisma.conversation.create({
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
  if (newConversation) {
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        conversationId: newConversation.id,
      },
    });
    return newConversation;
  }
}

export async function submitForm(formData: FormData) {
  const { userId }: { userId: string | null } = auth();
  if (!userId) {
    redirect("/login");
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
  const completion = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL + "/api/complete",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    }
  );
  const data = await completion.json();
  await createMessage({
    content: data.completion.message.content,
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

export async function getConversation() {
  const { userId }: { userId: string | null } = auth();
  if (!userId) {
    redirect("/login");
  }
  const user = await clerkClient.users.getUser(userId);
  const userConversationId = Number(user.privateMetadata.conversationId);

  if (userConversationId) {
  }
  let conversation;
  try {
    conversation = await prisma.conversation.findFirstOrThrow({
      where: {
        id: userConversationId,
      },
      include: {
        messages: true,
      },
    });
  } catch (e) {
    conversation = await createNewConversation(userId);
  }
  return conversation;
}
