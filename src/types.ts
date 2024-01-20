import { Message, Conversation } from "@prisma/client";

export type ConversationWithMessages = Conversation & {
  messages: Message[];
};
