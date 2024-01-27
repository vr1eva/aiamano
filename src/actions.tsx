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
  FetchMessagesArgs,
  FetchMessagesResponse,
  ROLE_ENUM,
  FetchAssistantResponse,
  ListAssistantsResponse,
  CreateRunResponse,
} from "@/types";
import { openai } from "@/openai";
import { toFile } from "openai";
import { streamToBuffer } from "@/lib/utils";

const schema = z.object({
  prompt: z.string({
    invalid_type_error: "Invalid prompt",
  }),
});

export async function listAssistants(): Promise<ListAssistantsResponse> {
  const assistants = await openai.beta.assistants.list({
    order: "desc",
  });
  if (!assistants || !assistants.data) {
    return {
      success: false,
    };
  }

  console.log(assistants);

  return {
    success: true,
    assistants: assistants.data,
  };
}

export async function retrieveAssistant({
  assistantId,
}: {
  assistantId: string;
}): Promise<FetchAssistantResponse> {
  const assistant = await openai.beta.assistants.retrieve(assistantId);
  if (!assistant) {
    return {
      success: false,
    };
  }

  return {
    assistant,
    success: true,
  };
}

export async function fetchMessages({
  threadId,
}: FetchMessagesArgs): Promise<FetchMessagesResponse> {
  const messages = await openai.beta.threads.messages.list(threadId);
  if (!messages) {
    return {
      success: false,
    };
  }
  return { success: true, messages };
}

async function createThread() {
  const { userId } = auth();
  if (!userId) {
    return {
      success: false,
    };
  }
  const user = await clerkClient.users.getUser(userId);
  const threadId = user.privateMetadata.threadId;
  if (!threadId) {
    const thread = await openai.beta.threads.create();
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        threadId: thread.id,
      },
    });
    if (!thread) {
      return { success: false };
    }
    return { thread, success: true };
  } else {
    const thread = await openai.beta.threads.retrieve(threadId as string);
    if (!thread) {
      return { success: false };
    }
    return { thread, success: true };
  }
}

async function createMessage({
  content,
}: CreateMessageArgs): Promise<CreateMessageResponse> {
  const { thread, success: threadFetched } = await fetchThread();
  if (!threadFetched || !thread) {
    return {
      success: false,
    };
  }
  const message = await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content,
  });
  if (!message) {
    return {
      success: false,
    };
  }
  return { message, success: true };
}

async function createRun(): Promise<CreateRunResponse> {
  const { thread, success: threadFetched } = await fetchThread();
  if (!threadFetched || !thread) {
    return {
      success: false,
    };
  }

  const run = await openai.beta.threads.runs.create(thread.id as string, {
    assistant_id: assistantId,
  });
  if (!run) {
    return { success: false };
  }

  const { run: completedRun, success: runCompleted } = await pollRun({
    runId: run.id,
  });
  if (!completedRun || !runCompleted) {
    return {
      success: false,
    };
  }
  return {
    run: completedRun,
    success: true,
  };
}

async function pollRun({ runId }: { runId: string }) {
  const { thread, success: threadFetched } = await fetchThread();
  if (!threadFetched || !thread) {
    return { success: false };
  }
  while (true) {
    try {
      const run = await openai.beta.threads.runs.retrieve(thread.id, runId);

      if (run.status == "completed") {
        console.log(`Run ${run.status}`);
        return {
          success: true,
          run,
        };
      } else {
        console.log(run.status);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Adjust the polling interval as needed
    } catch (error) {
      console.error(error);
      return {
        success: false,
      };
    }
  }
}

export async function submitForm(
  formData: FormData
): Promise<FormSubmissionResponse> {
  const { userId } = auth();
  if (!userId) {
    return { success: false };
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
  if (!threadMessageCreated || !threadMessage) {
    return { success: false };
  }

  const { run, success: assistantRanAgainstThread } = await createRun();
  if (!assistantRanAgainstThread || !run) {
    return { success: false };
  }

  return {
    success: true,
    run,
  };
}

export async function fetchThread(): Promise<FetchThreadResponse> {
  const { userId } = auth();
  if (!userId) {
    return {
      success: false,
    };
  }
  const user = await clerkClient.users.getUser(userId);
  const threadId = user.privateMetadata.threadId;
  if (!threadId) {
    const { thread, success: threadCreated } = await createThread();
    if (!thread || !threadCreated) {
      return { success: false };
    }
    return {
      thread,
      success: true,
    };
  } else {
    const thread = await openai.beta.threads.retrieve(threadId as string);
    if (!thread) {
      return {
        success: false,
      };
    }
    return { thread, success: true };
  }
}

async function attachFile({ fileId }: { fileId: string }) {
  const assistantFile = await openai.beta.assistants.files.create(assistantId, {
    file_id: fileId,
  });

  if (!assistantFile) {
    return {
      success: false,
    };
  }

  return {
    file: assistantFile,
    success: true,
  };
}

export async function getAssistants() {
  const assistants = await openai.beta.assistants.list({
    order: "desc",
    limit: 2,
  });

  if (!assistants) {
    return { success: false };
  }

  return {
    assistants,
    success: true,
  };
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
    file: await toFile(Buffer.from(base64Data), "input.mp3"),
    purpose: "assistants",
  });

  if (!userAudioFile || !userAudioFile.id) {
    return { success: false };
  }

  const userAttachment = await attachFileToAssistant({
    fileId: userAudioFile.id,
    assistantId: await getAssistant(),
  });

  const { transcript, success: transcribedSuccessfully } = await transcribe({
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

  const { message: textMessage, success: messageCreated } = await createMessage(
    {
      content: text,
      role: role as ROLE_ENUM,
    }
  );

  if (!messageCreated || !textMessage) {
    return { success: false };
  }
  const audioMessage = await prisma.audio.create({
    data: {
      content: buffer,
      message: {
        connect: {
          id: textMessage.id,
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
