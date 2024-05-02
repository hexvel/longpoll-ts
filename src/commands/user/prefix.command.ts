import { emojis } from "../../utils/emojies";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export default new Command({
  pattern: /^(?:префикс|prefix)$/i,
  name: "префикс",
  description: "Изменение префикса",

  handler: async (context, bot) => {
    const { text } = context;
    if (!text) return;

    const [_, __, prefixType, newPrefix] = text.split(" ");

    if (!prefixType || !newPrefix) {
      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} Не указан префикс. Пример: .н префикс <тип префикса> <новый префикс>`,
      });

      return;
    }

    const prefixMap: { [key: string]: string } = {
      команд: "command",
      скрипт: "script",
      админ: "admin",
    };

    const prefixField = prefixMap[prefixType];
    if (!prefixField) {
      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} Указан некорректный тип префикса.`,
      });

      return;
    }

    await bot.prisma.prefix.update({
      where: {
        userId: context.senderId,
      },
      data: {
        [prefixField]: newPrefix,
      },
    });

    if (bot.owner.prefix) {
      switch (prefixMap[prefixType]) {
        case "command":
          bot.owner.prefix.command = newPrefix;
          break;
        case "script":
          bot.owner.prefix.script = newPrefix;
          break;
        case "admin":
          bot.owner.prefix.admin = newPrefix;
          break;
      }
    }

    await methods.editMessage({
      api: bot.api,
      context,
      message: `${emojis.success} Префикс ${prefixType} установлен на [${newPrefix}].`,
    });
  },
});
