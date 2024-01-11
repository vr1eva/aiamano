"use server"
import {PrismaClient} from "@prisma/client"
import {auth, clerkClient } from "@clerk/nextjs" 
import { redirect } from 'next/navigation'
const prisma = new PrismaClient()
import { z } from 'zod'
import { revalidatePath } from "next/cache"

const schema = z.object({
  prompt: z.string({
    invalid_type_error: 'Invalid prompt',
  }),
})

async function createNewConversation(userId: string) {
    const newConversation = await prisma.conversation.create(({
        data: {
            messages: {
                create: [
                    {role: "system", content: "You are a helpful assistant."},
                ]
            }
        }
    }))
    if(newConversation) {
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: {
                conversationId: newConversation.id
            }
        });
    }
}
 
export async function getCompletion(formData: FormData) {
    const { userId } : { userId: string | null } = auth();
    if(!userId) {
        redirect('/login')
    }
    const validatedFields = schema.safeParse({
        prompt: formData.get('prompt')
    })
    if(!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors
        }
    } 
    const conversation = await getConversation()
    if(!conversation  || !conversation.messages) {
        return 
    }
    const newMessage = await createMessage({content: validatedFields.data.prompt, role: "user", conversationId: conversation.id}) 
    const messages  = [...conversation.messages , newMessage].map(message => ({role: message?.role, content: message?.content, }))
    const completion = await fetch(process.env.NEXT_PUBLIC_BASE_URL + '/api/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({messages}),
    })
    const data = await completion.json();
    await createMessage({content: data.completion.message.content, role: "system", conversationId: conversation.id}) 
    revalidatePath('/chat');
}

interface CreateMessageArgs {
    content: string;
    role: string;
    conversationId: number;
}
async function createMessage({content, role, conversationId}: CreateMessageArgs)  {
    const message = await prisma.message.create({
        data: {
            content,
            role,
            conversation: {
                connect: {
                    id: conversationId
                }
            }
        }
    })

    return message ? message : null
}

export async function getConversation() {
    const { userId } : { userId: string | null } = auth();
    if(!userId) {
        redirect('/login')
    }

    const user = await clerkClient.users.getUser(userId)
    
    if(!user.privateMetadata.conversationId) {
        await createNewConversation(userId)
    }
    const conversationId = Number(user.privateMetadata.conversationId); 
    const conversation = await prisma.conversation.findUnique({
        where: {
            id: conversationId
        },
        include: {
            messages: true
        }
    })

    if(conversation) {
        return conversation
    }
    return null
}