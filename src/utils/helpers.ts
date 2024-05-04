import chalk from "chalk";
import { API, MessageContext, resolveResource } from "vk-io";
import { Bot } from "../bot";
import { IBotContext } from "../context/context.interface";
import { IList } from "../entities/user.model";
import { emojis } from "./emojies";

class Helpers {
  async resolveResourceId(api: API, context: MessageContext): Promise<number> {
    await context.loadMessagePayload();
    const splitText = context.text?.split(" ");
    const resourceSpecifier = splitText ? splitText[2] : undefined;

    if (!resourceSpecifier) {
      return context.replyMessage?.senderId || context.senderId;
    }

    try {
      const resolvedResource = await resolveResource({
        api: api,
        resource: resourceSpecifier,
      });

      return resolvedResource?.type === "group"
        ? -resolvedResource.id
        : resolvedResource.id;
    } catch {
      return context.senderId;
    }
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

  async logRegisteredCommands(bot: Bot): Promise<void> {
    console.log(chalk.yellow("Registered commands:"));

    for (const command of bot.commands) {
      console.log(
        chalk.magenta(`${emojis.lightning} ${chalk.bold.red(command.name)}`)
      );
      console.log(chalk.cyan(`   |-- ${command.description}`));
    }
  }

  async getAfterSplit(
    text: string
  ): Promise<{ prefix: string; action: string; sub: string }> {
    const [prefix, ...rest] = text.split(" ")!;
    const [action, ...ctxArray] = rest;
    const sub = ctxArray.join(" ");

    return { prefix, action, sub };
  }
}

export const helpers = new Helpers();
