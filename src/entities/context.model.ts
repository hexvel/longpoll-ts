import { API, MessageContext } from "vk-io";

export interface IEditMessageContext {
  api: API;
  context: MessageContext;
  message: string;
  attachments?: string;
  messageId?: number;
}

export interface ISendMessageContext {
  api: API;
  context: MessageContext;
  message: string;
  randomId?: number;
}
