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
    const { text } = context;
    if (!text) return;

    const [_, __, prefixType, newPrefix] = text.split(" ");

    if (!prefixType || !newPrefix) {
      return methods.editMessage({
        api: this.bot.api,
        context,
        message: `${emojis.warning} Не указан префикс. Пример: .н префикс <тип префикса> <новый префикс>`,
      });
    }

    const prefixMap: { [key: string]: string } = {
      команд: "commandPrefix",
      скрипт: "scriptPrefix",
      админ: "adminPrefix",
    };

    const prefixField = prefixMap[prefixType];
    if (!prefixField) {
      return methods.editMessage({
        api: this.bot.api,
        context,
        message: `${emojis.warning} Указан некорректный тип префикса.`,
      });
    }

    await this.bot.prisma.user.update({
      where: {
        id: context.senderId,
      },
      data: {
        [prefixField]: newPrefix,
      },
    });

    switch (prefixMap[prefixType]) {
      case "commandPrefix":
        this.bot.owner.commandPrefix = newPrefix;
        break;
      case "scriptPrefix":
        this.bot.owner.scriptPrefix = newPrefix;
        break;
      case "adminPrefix":
        this.bot.owner.adminPrefix = newPrefix;
        break;
    }

    return methods.editMessage({
      api: this.bot.api,
      context,
      message: `${emojis.success} Префикс ${prefixType} установлен на [${newPrefix}].`,
    });
  }
}
