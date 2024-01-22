import { Message, Conversation, Audio } from "@prisma/client";

export type ConversationWithMessages = Conversation & {
  messages: Message[];
};

export type OptimisticMessage = ParsedMessage | Message

export type ConversationWithParsedMessages = Conversation & {
  messages: ParsedMessage[]
}

export type ConversationWithOptimisticMessages = Conversation & {
  messages: ParsedMessage[] | Message[]
}

export type ConversationFetchResponse = {
  conversation?: ConversationWithMessages
  success: boolean
}


export interface ConversationFetchArgs {
  parsed?: boolean
}

export type CreateMessageResponse = {
  message?: Message
  success: boolean
}

export interface CreateMessageArgs {
  content: string;
  role: string;
}

export type FormatConversationResponse = {
  conversation?: ConversationWithParsedMessages
  success: boolean
}

export type FormSubmissionResponse = {
  success: boolean
}

export type ParsedMessage = {
  role: string,
  content: string,
}

export interface TranscribeArgs {
  base64Data: string
}
export interface SendAudioArgs {
  base64Data: string
}
export type TranscribeResponse = {
  success: boolean,
  transcript?: string
}

export type CompleteResponse = {
  completion?: string,
  success: boolean
}

export type TextToSpeechResponse = {
  speechBuffer?: Buffer,
  success: boolean
}

export interface CreateAudioMessageArgs {
  text: string,
  buffer: Buffer
}

export type MessageWithAudio = Message & {
  audio?: Audio
}

export interface ChatArgs {
  conversation: ConversationWithMessages,
  userAvatar: string
}

export interface UseOptimisticConversationProps {
  initialConversation: ConversationWithMessages;
}
