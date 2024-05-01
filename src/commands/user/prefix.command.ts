import { MessageContext } from "vk-io";
import { IBotContext } from "../../context/context.interface";
import { emojis } from "../../utils/emojies";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

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
      команд: "command",
      скрипт: "script",
      админ: "admin",
    };

    const prefixField = prefixMap[prefixType];
    if (!prefixField) {
      return methods.editMessage({
        api: this.bot.api,
        context,
        message: `${emojis.warning} Указан некорректный тип префикса.`,
      });
    }

    await this.bot.prisma.prefix.update({
      where: {
        userId: context.senderId,
      },
      data: {
        [prefixField]: newPrefix,
      },
    });

    if (this.bot.owner.prefix) {
      switch (prefixMap[prefixType]) {
        case "command":
          this.bot.owner.prefix.command = newPrefix;
          break;
        case "script":
          this.bot.owner.prefix.script = newPrefix;
          break;
        case "admin":
          this.bot.owner.prefix.admin = newPrefix;
          break;
      }
    }

    return methods.editMessage({
      api: this.bot.api,
      context,
      message: `${emojis.success} Префикс ${prefixType} установлен на [${newPrefix}].`,
    });
  }
}
