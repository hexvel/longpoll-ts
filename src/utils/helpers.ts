import { API, MessageContext, resolveResource } from "vk-io";

class Helpers {
  async resolveResourceId(api: API, context: MessageContext): Promise<number> {
    await context.loadMessagePayload();
    const splitText = context.text?.split(" ");
    const resourceSpecifier = splitText ? splitText[2] : undefined;

    if (!resourceSpecifier) {
      return context.replyMessage?.senderId || context.senderId;
    }

    const resolvedResource = await resolveResource({
      api: api,
      resource: resourceSpecifier,
    });

    return resolvedResource?.type === "group"
      ? -resolvedResource.id
      : resolvedResource.id;
  }

  parsePrismaJSON<T>(obj: T, key?: string): T {
    if (typeof obj === "object" && obj !== null && key && key in obj) {
      return obj;
    }

    return JSON.parse(JSON.stringify(obj));
  }
}

export const helpers = new Helpers();
