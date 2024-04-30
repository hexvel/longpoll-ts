import { MessageContext } from "vk-io";
import { IBotContext } from "../context/context.interface";
import { emojis } from "../utils/emojies";
import { methods } from "../utils/methods";
import { Command } from "./command.module";

export class PrefixCommand extends Command {
  constructor(bot: IBotContext) {
    super(bot);
  }

  async handle(context: MessageContext): Promise<void> {
    const splitText = context.text?.split(" ");

    if (!splitText || splitText?.length < 3) {
      return methods.editMessage({
        api: this.bot.api,
        context,
        message: `${emojis.warning} Не указан префикс. Пример: .н префикс <тип префикса> <новый префикс>`,
      });
    }

    const prefixType = splitText[2];

    if (prefixType === "команда") {
      await this.bot.prisma.user.update({
        where: {
          id: context.senderId,
        },
        data: {
          commandPrefix: splitText[3],
        },
      });

      this.bot.owner.commandPrefix = splitText[3];

      return methods.editMessage({
        api: this.bot.api,
        context,
        message: `${emojis.success} Префикс команд ${prefixType} установлен на [${splitText[3]}].`,
      });
    } else if (prefixType === "скрипт") {
      await this.bot.prisma.user.update({
        where: {
          id: context.senderId,
        },
        data: {
          scriptPrefix: splitText[3],
        },
      });

      this.bot.owner.scriptPrefix = splitText[3];

      return methods.editMessage({
        api: this.bot.api,
        context,
        message: `${emojis.success} Префикс скриптов ${prefixType} установлен на [${splitText[3]}].`,
      });
    } else if (prefixType === "админ") {
      await this.bot.prisma.user.update({
        where: {
          id: context.senderId,
        },
        data: {
          adminPrefix: splitText[3],
        },
      });

      this.bot.owner.adminPrefix = splitText[3];

      return methods.editMessage({
        api: this.bot.api,
        context,
        message: `${emojis.success} Префикс админа ${prefixType} установлен на [${splitText[3]}].`,
      });
    }
  }
}
