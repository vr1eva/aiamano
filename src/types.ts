import { Message, Conversation, Audio } from "@prisma/client";

export type ConversationFetchResponse = {
  conversation?: ConversationWithMessages;
  success: boolean;
};

export type ConversationWithMessages = Conversation & {
  messages: Message[];
};

export type ConversationWithCompletionMessages = Conversation & {
  messages: CompletionMessage[];
};

export enum ROLE_ENUM {
  user = "user",
  assistant = "assistant",
  system = "system",
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

export type ConversationWithOptimisticMessages = Conversation & {
  messages: OptimisticMessage[];
};

export type OptimisticMessage = {
  role: string;
  content: string;
  audio?: Audio;
};

export interface ConversationFetchArgs {
  parsed?: boolean;
}

export type CreateMessageResponse = {
  message?: Message;
  success: boolean;
};

export interface CreateMessageArgs {
  content: string;
  role: string;
}

export type FormSubmissionResponse = {
  success: boolean;
};

export interface TranscribeArgs {
  base64Data: string;
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
  conversation: ConversationWithMessages;
  userAvatar: string;
}

export interface UseOptimisticConversationProps {
  initialConversation: ConversationWithMessages;
}

export interface Agent {
  id: number;
  name: string;
  handle: string;
  agentAvatar: string;
}
