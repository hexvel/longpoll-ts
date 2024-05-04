import { API, MessageContext } from "vk-io";

export interface IEditMessageContext {
  api: API;
  context: MessageContext;
  peerId?: number;
  message: string;
  attachments?: string;
  messageId?: number;
}

export interface ISendMessageContext {
  api: API;
  context?: MessageContext;
  peerId?: number;
  message?: string;
  attachments?: string;
  randomId?: number;
}
