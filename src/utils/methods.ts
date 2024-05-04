import { API, getRandomId } from "vk-io";
import { MessagesSendUserIdsResponse } from "vk-io/lib/api/schemas/responses";
import {
  IEditMessageContext,
  ISendMessageContext,
} from "../entities/context.model";

class VkMethods {
  async checkToken(token: string): Promise<{ isOk: boolean; token: string }> {
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

    return { isOk, token };
  }

  async sendMessage(
    params: ISendMessageContext
  ): Promise<MessagesSendUserIdsResponse> {
    const response = await params.api.messages.send({
      peer_id: params.peerId || params.context?.peerId,
      message: params.message,
      attachment: params.attachments,
      random_id: getRandomId(),
    });

    return response;
  }

  async editMessage(params: IEditMessageContext) {
    await params.api.messages.edit({
      peer_id: params.peerId || params.context?.peerId,
      message: params.message,
      attachment: params.attachments,
      message_id: params.messageId || params.context?.id,
      keep_forward_messages: true,
    });
  }
}

export const methods = new VkMethods();
