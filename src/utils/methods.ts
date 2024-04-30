import { getRandomId } from "vk-io";
import {
  IEditMessageContext,
  ISendMessageContext,
} from "../entities/context.model";

class VkMethods {
  async sendMessage(params: ISendMessageContext) {
    await params.api.messages.send({
      peer_id: params.context.peerId,
      message: params.message,
      random_id: getRandomId(),
    });
  }
  async editMessage(params: IEditMessageContext) {
    await params.api.messages.edit({
      peer_id: params.context.peerId,
      message: params.message,
      message_id: params.messageId || params.context.id,
      keep_forward_messages: true,
    });
  }
}

export const methods = new VkMethods();
