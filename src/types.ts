import { Conversation, Audio } from "@prisma/client";
import { FileObject } from "openai/resources/files";
import { Thread } from "openai/resources/beta/threads/threads"
import { Run } from "openai/resources/beta/threads/runs/runs";
import { ThreadMessage } from "openai/resources/beta/threads/messages/messages"
import { Assistant } from "openai/resources/beta/assistants/assistants"

export type FetchAssistantResponse = {
  assistant?: Assistant,
  success: boolean
}

export type AssistantMetadata = {
  avatarUrl: string
}

export type FetchThreadResponse = {
  thread?: Thread;
  success: boolean;
};

export type ThreadWithMessages = Conversation & {
  messages: ThreadMessage[];
};

export type ConversationWithCompletionMessages = Conversation & {
  messages: CompletionMessage[];
};

export enum ROLE_ENUM {
  user = "user",
  assistant = "assistant",
  system = "system",
}
export enum THREAD_MESSAGES_OFFSET {
  "default" = 1
}

export type CompletionMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  name?: string;
};

export type PrepareConversationResponse = {
  conversation?: ConversationWithCompletionMessages;
  success: boolean;
};

export type ThreadWithOptimisticMessages = {
  id: string,
  messages: OptimisticThreadMessage[];
};

export type OptimisticThreadMessage = {
  role: string;
  content: string;
  audio?: Audio;
};

export interface ConversationFetchArgs {
  parsed?: boolean;
}

export interface CreateMessageArgs {
  content: string;
}

export type CreateMessageResponse = {
  message?: ThreadMessage;
  success: boolean;
};

export type CreateRunResponse = {
  success: boolean;
  run?: Run;
}

export type FormSubmissionResponse = {
  success: boolean;
};

export interface TranscribeArgs {
  audioFile: FileObject;
}
export interface SendAudioArgs {
  base64Data: string;
}
export type TranscribeResponse = {
  success: boolean;
  transcript?: string;
  buffer?: Buffer;
};

export type CompleteResponse = {
  completion?: string;
  success: boolean;
};

export type TextToSpeechResponse = {
  speechBuffer?: Buffer;
  success: boolean;
};

export interface CreateAudioMessageArgs {
  text: string;
  buffer: Buffer;
  role: ROLE_ENUM;
}

export type MessageWithAudio = Message & {
  audio?: Audio;
};

export interface ChatArgs {
  thread: Thread
  userAvatar: string;
  messages: ThreadMessage[]
}

export interface UseOptimisticThreadProps {
  initialThread: Thread
}

export interface Agent {
  id: number;
  name: string;
  handle: string;
  agentAvatar: string;
}

export interface AudioMessageProps {
  audio: Audio;
}


export interface MessageArgs {
  message: OptimisticMessage,
  avatar: string
}