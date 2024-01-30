import { FileObject } from "openai/resources/files";
import { Thread } from "openai/resources/beta/threads/threads";
import { Run } from "openai/resources/beta/threads/runs/runs";
import {
  ThreadMessage,
  ThreadMessagesPage,
  MessageContentImageFile,
  MessageContentText,
} from "openai/resources/beta/threads/messages/messages";
import { Assistant } from "openai/resources/beta/assistants/assistants";

export interface MessageContentArgs {
  content: Array<MessageContentImageFile | MessageContentText>;
}

export type FetchAssistantResponse = {
  assistant?: Assistant
  success: boolean;
};

export type ListAssistantsResponse = {
  assistants?: Assistant[];
  success: boolean;
};

export type AssistantMetadata = {
  avatarUrl: string;
  duty: string,
  chalk: string,
};
export interface FetchThreadArgs {
  assistantId: string;
}
export type FetchThreadResponse = {
  thread?: Thread;
  success: boolean;
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

export type OptimisticThreadMessage = ThreadMessage | {
  role: string;
  content: (MessageContentImageFile | MessageContentText)[];
};

export interface ConversationFetchArgs {
  parsed?: boolean;
}

export interface CreateMessageArgs {
  content: string;
  threadId: string;
}

export type CreateMessageResponse = {
  message?: ThreadMessage;
  success: boolean;
};

export interface CreateRunArgs {
  threadId: string;
  assistantId: string;
}

export type CreateRunResponse = {
  success: boolean;
  run?: Run;
};

export interface PollRunArgs {
  runId: string;
  threadId: string;
}

export type PollRunResponse = {
  run?: Run;
  success: boolean;
}
export interface FetchMessagesArgs {
  threadId: string;
}

export type FetchMessagesResponse = {
  messages?: ThreadMessage[];
  success: boolean;
};
export interface FormArgs {
  addOptimisticMessage: Function;
  threadId: string;
  assistantId: string;
}

export interface SubmitFormArgs {
  prompt: string;
  assistantId: string;
  threadId: string;
}

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
  threadId: string;
  assistantId: string;
  messages: ThreadMessage[];
  participants: {
    user: {
      avatar: string
    },
    assistant: {
      avatar: string
    }
  }
}

export interface Agent {
  id: number;
  name: string;
  handle: string;
  agentAvatar: string;
}

export interface MessageArgs {
  message: ThreadMessage;
  avatar: string;
}

export interface MessageAvatarArgs {
  avatar: string;
}

