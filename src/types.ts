import { Message, Conversation } from "@prisma/client";

export type ConversationWithMessages = Conversation & {
  messages: Message[];
};

export type ConversationFetchResponse = {
  conversation?: ConversationWithMessages
  success: boolean
}

export type CreateMessageResponse = {
  message?: Message
  success: boolean
}

export interface CreateMessageArgs {
  content: string;
  role: string;
  conversationId: number;
}

export type FormSubmissionResponse = {
  success: boolean
}

export type ParsedMessage = {
  role: string,
  content: string,
}

export interface CreateCompletionArgs {
  messages: ParsedMessage[]
}

export type TranscribeResponse = {
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