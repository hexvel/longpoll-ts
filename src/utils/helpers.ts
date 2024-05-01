import { API, MessageContext, resolveResource } from "vk-io";
import { IBotContext } from "../context/context.interface";
import { IList } from "../entities/user.model";

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

  async updateUserList(
    bot: IBotContext,
    senderId: number,
    newData: IList
  ): Promise<void> {
    try {
      await bot.prisma.user.update({
        where: {
          id: senderId,
        },
        data: {
          list: {
            ...newData,
          },
        },
      });
    } catch (error) {
      console.error(
        "Ошибка при обновлении списка игнорируемых пользователей:",
        error
      );
    }
  }
}

export const helpers = new Helpers();
