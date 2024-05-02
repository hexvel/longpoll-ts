import { PrismaClient } from "@prisma/client";
import { emojis } from "../../utils/emojies";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

const prisma = new PrismaClient();

export default new Command({
  pattern: /^(?:триггеры|triggers)$/i,
  name: "триггеры",
  description: "Вывод списка триггеров",

  handler: async (context, bot) => {
    try {
      const triggers = await prisma.trigger.findMany();

      if (!triggers || triggers.length === 0) {
        const emptyMessage = `${emojis.warning} Список триггеров пуст.`;

        return methods.editMessage({
          api: bot.api,
          context,
          message: emptyMessage,
        });
      }

      const triggerListMessage = triggers
        .map(
          trigger =>
            `${emojis.inboxTray} ${trigger.word}\n&#4448;${emojis.outboxTray} ${trigger.answer}`
        )
        .join("\n");

      const message = `${emojis.bookmark} Список триггеров:\n${triggerListMessage}`;

      methods.editMessage({
        api: bot.api,
        context,
        message,
      });
    } catch (error) {
      const errorMessage = `${emojis.error} Произошла ошибка при получении списка триггеров. Пожалуйста, попробуйте ещё раз.`;
      return methods.editMessage({
        api: bot.api,
        context,
        message: errorMessage,
      });
    }
  },
});
