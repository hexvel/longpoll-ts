import { API, getRandomId } from "vk-io";

class VkMethods {
  sendMessage(api: API, peerId: number, message: string) {
    api.messages.send({
      peer_id: peerId,
      message: message,
      random_id: getRandomId(),
    });
  }
  editMessage(api: API, peerId: number, messageId: number, message: string) {
    api.messages.edit({
      peer_id: peerId,
      message: message,
      message_id: messageId,
      keep_forward_messages: true,
    });
  }
}

export const methods = new VkMethods();
