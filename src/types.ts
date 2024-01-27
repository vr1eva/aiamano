import {
  Assistant as AssistantAvatar,
  Conversation,
  Audio,
} from "@prisma/client";
import { FileObject } from "openai/resources/files";
import { Thread } from "openai/resources/beta/threads/threads";
import { Run } from "openai/resources/beta/threads/runs/runs";
import {
  ThreadMessage,
  ThreadMessagesPage,
  MessageContentImageFile,
  MessageContentText,
} from "openai/resources/beta/threads/messages/messages";
import {
  Assistant,
  AssistantsPage,
} from "openai/resources/beta/assistants/assistants";

export interface FetchAvatarArgs {
  openaiId: string;
}

export type FetchAvatarResponse = {
  success: boolean;
  avatar?: AssistantAvatar;
};
export type FetchAssistantResponse = {
  assistant?: Assistant;
  success: boolean;
};

export type ListAssistantsResponse = {
  assistants?: AssistantsPage;
  success: boolean;
};

export type AssistantWithMetadata = Assistant & {
  metadata: {
    avatarUrl: string;
  };
};

export type FetchThreadResponse = {
  thread?: Thread;
  success: boolean;
};

export type ThreadWithMessages = Conversation & {
  messages: ThreadMessage[];
};

export type ThreadMessageContent = {
  type: string;
  image_file?: {
    file_id: string;
  };
  text: {
    value: string;
  };
};

export type ConversationWithCompletionMessages = Conversation & {
  messages: CompletionMessage[];
};

export enum ROLE_ENUM {
  user = "user",
  assistant = "assistant",
  system = "system",
}

export enum TOOL_ENUM {
  function = "function",
  code_interpreter = "code_interpreter",
  retrieval = "retrieval",
}
export enum THREAD_MESSAGES_OFFSET {
  "default" = 1,
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

export type OptimisticThreadMessage = {
  role: string;
  content: (MessageContentImageFile | MessageContentText)[];
  audio?: MessageContentImageFile;
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
};

export interface FetchMessagesArgs {
  threadId: string;
}

export type FetchMessagesResponse = {
  messages?: ThreadMessagesPage;
  success: boolean;
};

export type FormSubmissionResponse = {
  success: boolean;
  run?: Run;
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

export interface ChatArgs {
  messages: ThreadMessage[];
  userAvatar: string;
}

export interface UseOptimisticThreadProps {
  initialMessages: ThreadMessage[];
}

export interface ThreadArgs {
  messages: OptimisticThreadMessage[];
  userAvatar: string;
  systemAvatar?: string;
  separatorRef: React.RefObject<HTMLElement> | null;
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
  message: OptimisticMessage;
  avatarUrl: string;
}
