"use server";
import { auth, clerkClient, currentUser } from "@clerk/nextjs";
import { prisma } from "@/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  FetchThreadResponse,
  CreateMessageResponse,
  CreateMessageArgs,
  FormSubmissionResponse,
  CompleteResponse,
  TranscribeArgs,
  SendAudioArgs,
  PrepareConversationResponse,
  TranscribeResponse,
  TextToSpeechResponse,
  CreateAudioMessageArgs,
  ConversationWithMessages,
  ROLE_ENUM,
  FetchAssistantResponse,
  CreateRunResponse,
} from "@/types";
import { openai } from "@/openai";
import { toFile } from "openai"
import { streamToBuffer } from "@/lib/utils";

const schema = z.object({
  prompt: z.string({
    invalid_type_error: "Invalid prompt",
  }),
});

const assistantId = process.env.OPENAI_ASSISTANT_ID as string

export async function fetchAssistant(): Promise<FetchAssistantResponse> {
  const assistant = await openai.beta.assistants.retrieve(
    assistantId
  )
  if (!assistant) {
    return {
      success: false
    }
  }

  return {
    assistant, success: true
  }
}

export async function fetchMessages({ threadId }: { threadId: string }) {
  const messages = await openai.beta.threads.messages.list(
    threadId
  )

  if (!messages) {
    return {
      success: false
    }
  } return messages
}

async function createThread() {
  const { userId } = auth();
  if (!userId) {
    return {
      success: false
    }
  }
  const user = await clerkClient.users.getUser(userId);
  const threadId = user.privateMetadata.threadId;
  if (!threadId) {
    const thread = await openai.beta.threads.createAndRun({
      assistant_id: assistantId,
      thread: {
        messages: [
          { role: "user", content: "Help me learn things in the world." }
        ]
      }
    })
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        threadId: thread.id,
      }
    });
  } else {
    const thread = await openai.beta.threads.retrieve(threadId as string)
    return { thread, success: true }
  }
}


async function createMessage({ content }: CreateMessageArgs): Promise<CreateMessageResponse> {
  const { thread, success: threadFetched } = await fetchThread()
  if (!threadFetched || !thread) {
    return {
      success: false
    }
  }
  const message = await openai.beta.threads.messages.create(
    thread.id, { role: "user", content }
  )
  if (!message) {
    return {
      success: false
    }
  }
  return { message, success: true }
}

async function createRun(): Promise<CreateRunResponse> {
  const { userId } = auth();
  if (!userId) {
    return {
      success: false
    }
  }
  const user = await clerkClient.users.getUser(userId);
  const threadId = user.privateMetadata.threadId;
  if (!threadId) {
    return { success: false }
  }

  const run = await openai.beta.threads.runs.create(
    threadId as string,
    { assistant_id: assistantId }
  )

  return {
    run,
    success: true
  }
}

export async function submitForm(
  formData: FormData
): Promise<FormSubmissionResponse> {
  const { userId } = auth();
  if (!userId) {
    return { success: false }
  }
  const validatedFields = schema.safeParse({
    prompt: formData.get("prompt"),
  });
  if (!validatedFields.success || !validatedFields.data.prompt) {
    return {
      success: false,
    };
  }
  const { message: threadMessage, success: threadMessageCreated } =
    await createMessage({
      content: validatedFields.data.prompt,
    });

  if (!threadMessage || !threadMessageCreated) {
    return { success: false };
  }

  const { run: assistantThreadRun, success: runCompleted } =
    await createRun();
  if (!runCompleted || !assistantThreadRun) {
    return { success: false };
  }

  console.log(assistantThreadRun)

  // const { message: systemMessage, success: systemMessageCreated } =
  //   await createMessage({
  //     content: null,
  //     role: "system",
  //   });

  // if (!systemMessageCreated || !systemMessage) {
  //   return {
  //     success: false,
  //   };
  // }
  // console.log("Text received:", systemMessage);
  // revalidatePath("/");
  return {
    success: true,
  };
}

export async function fetchThread(): Promise<FetchThreadResponse> {
  const { userId } = auth();
  if (!userId) {
    return {
      success: false
    }
  }
  const user = await clerkClient.users.getUser(userId);
  const threadId = user.privateMetadata.threadId;
  if (!threadId) {
    return { success: false }
  }
  const thread = await openai.beta.threads.retrieve(threadId as string)
  if (!thread) {
    return {
      success: false
    }
  }
  return { thread, success: true }
}

async function attachFile({ fileId }: { fileId: string }) {
  const assistantFile = await openai.beta.assistants.files.create(
    assistantId,
    {
      file_id: fileId
    }
  )

  if (!assistantFile) {
    return {
      success: false
    }
  }

  return {
    file: assistantFile,
    success: true
  }
}

export async function getAssistants() {
  const assistants = await openai.beta.assistants.list({
    order: "desc",
    limit: 2
  })

  if (!assistants) {
    return { success: false }
  }

  return {
    assistants, success: true
  }
}

export async function sendAudio({ base64Data }: SendAudioArgs) {
  const { userId } = auth();
  if (!userId) {
    return {
      success: false,
    };
  }
  const user = await currentUser();
  if (!user) {
    return {
      success: false,
    };
  }

  const userAudioFile = await openai.files.create({
    file: await toFile(Buffer.from(base64Data), 'input.mp3'),
    purpose: 'assistants',
  });

  if (!userAudioFile || !userAudioFile.id) {
    return { success: false }
  }

  const userAttachment = await attachFileToAssistant({ fileId: userAudioFile.id, assistantId: await getAssistant() })

  const {
    transcript,
    success: transcribedSuccessfully,
  } = await transcribe({
    audioFile: userAudioFile,
  });

  if (!transcribedSuccessfully || !transcript) {
    return {
      success: false,
    };
  }

  const { audioMessage: userAudioMessage, success: userAudioMessageSaved } =
    await createAudioMessage({
      text: transcript,
      buffer: userAudioBuffer,
      role: "user" as ROLE_ENUM,
    });

  if (!userAudioMessageSaved || !userAudioMessage) {
    return { success: false };
  }

  const { completion: systemText, success: responseReceived } =
    await complete();

  if (!responseReceived || !systemText) {
    return {
      success: false,
    };
  }

  const { speechBuffer: systemAudioBuffer, success: speechGenerated } =
    await textToSpeech({
      input: systemText,
    });

  if (!speechGenerated || !systemAudioBuffer) {
    return {
      success: false,
    };
  }

  const {
    audioMessage: systemAudioMessage,
    success: systemAudioMessageCreated,
  } = await createAudioMessage({
    text: systemText,
    buffer: systemAudioBuffer,
    role: "system" as ROLE_ENUM,
  });

  if (!systemAudioMessageCreated || !systemAudioMessage) {
    return {
      success: false,
    };
  }
  revalidatePath("/");
  return {
    transcript,
    success: true,
  };
}

export async function transcribe({
  audioFile,
}: TranscribeArgs): Promise<TranscribeResponse> {


  const transcript = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
  });

  if (!transcript) {
    return { success: false };
  }

  return {
    transcript: transcript.text,
    success: true,
  };
}

export async function textToSpeech({
  input,
}: {
  input: string;
}): Promise<TextToSpeechResponse> {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input,
  });

  const readableStream = mp3.body as unknown as NodeJS.ReadableStream;
  const speechBuffer = await streamToBuffer(readableStream);
  return { speechBuffer, success: true };
}

async function createAudioMessage({
  text,
  buffer,
  role,
}: CreateAudioMessageArgs) {
  const { conversation, success: conversationFetched } =
    await getConversation();
  if (!conversationFetched || !conversation) {
    return {
      success: false,
    };
  }

  const { message: textMessage, success: messageCreated } = await createMessage({
    content: text,
    role: role as ROLE_ENUM,
  })

  if (!messageCreated || !textMessage) {
    return { success: false }
  }
  const audioMessage = await prisma.audio.create({
    data: {
      content: buffer,
      message: {
        connect: {
          id: textMessage.id
        },
      },
    },
  });

  if (!audioMessage) {
    return { success: false };
  }

  return { audioMessage, success: true };
}

export async function complete(): Promise<CompleteResponse> {
  const { conversation, success: conversationFetched } =
    await getConversation();
  if (!conversationFetched || !conversation || !conversation.messages) {
    return {
      success: false,
    };
  }
  const {
    conversation: preparedConversation,
    success: conversationMessagesFormatted,
  } = await prepareConversationForCompletion({ conversation });
  if (
    !conversationMessagesFormatted ||
    !preparedConversation ||
    !preparedConversation.messages
  ) {
    return {
      success: false,
    };
  }

  const completion = await openai.chat.completions.create({
    messages: preparedConversation.messages,
    model: "gpt-3.5-turbo",
  });

  if (!completion || !completion.choices[0].message.content) {
    return { success: false };
  }

  return { completion: completion.choices[0].message.content, success: true };
}

async function prepareConversationForCompletion({
  conversation,
}: {
  conversation: ConversationWithMessages;
}): Promise<PrepareConversationResponse> {
  if (!conversation || !conversation.messages) {
    return { success: false };
  }

  return {
    conversation: {
      ...conversation,
      messages: conversation.messages.map((message) => ({
        role: message.role as ROLE_ENUM,
        content: message.content,
      })),
    },
    success: true,
  };
}
