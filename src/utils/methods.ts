import { API, getRandomId } from "vk-io";
import {
  IEditMessageContext,
  ISendMessageContext,
} from "../entities/context.model";

class VkMethods {
  async checkToken(token: string): Promise<boolean> {
    const appId = 6121396;
    let isOk = false;

    try {
      if (token.length > 240) {
        const params = new URLSearchParams(token.split("#")[1]);
        token = params.get("access_token") || "";
      }

      const api = new API({ token });
      const apps = await api.apps.get({});

      isOk = apps.items.some(item => item.id === appId);
    } catch (err) {
      isOk = false;
    }

    return isOk;
  }

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
      attachment: params.attachments,
      message_id: params.messageId || params.context.id,
      keep_forward_messages: true,
    });
  }
}

export const methods = new VkMethods();
