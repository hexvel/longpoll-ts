import { API, getRandomId, MessageContext } from "vk-io";

class VkMethods {
  async sendMessage(api: API, context: MessageContext, message: string) {
    await api.messages.send({
      peer_id: context.peerId,
      message: message,
      random_id: getRandomId(),
    });
  }
  async editMessage(
    api: API,
    context: MessageContext,
    message: string,
    messageId?: number
  ) {
    await api.messages.edit({
      peer_id: context.peerId,
      message: message,
      message_id: messageId || context.id,
      keep_forward_messages: true,
    });
  }
}

export const methods = new VkMethods();
