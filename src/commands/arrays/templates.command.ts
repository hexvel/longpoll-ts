import { PrismaClient } from "@prisma/client";
import { emojis } from "../../utils/emojies";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

const prisma = new PrismaClient();

export default new Command({
  pattern: /^(?:шабы|templates)$/i,
  name: "шабы",
  description: "Вывод списка шаблонов",

  handler: async (context, bot) => {
    try {
      const templates = await prisma.template.findMany({
        where: { id: context.senderId },
      });

      if (!templates || templates.length === 0) {
        const emptyMessage = `${emojis.warning} Список шаблонов пуст.`;

        return methods.editMessage({
          api: bot.api,
          context,
          message: emptyMessage,
        });
      }

      const triggerListMessage = templates
        .map(templates =>
          templates.attachment
            ? `${emojis.inboxTray} ${templates.name}\n&#4448;${emojis.outboxTray} (с вложением)`
            : `${emojis.inboxTray} ${templates.name}`
        )
        .join("\n");

      const message = `${emojis.bookmark} Список шаблонов:\n${triggerListMessage}`;

      methods.editMessage({
        api: bot.api,
        context,
        message,
      });
    } catch (error) {
      const errorMessage = `${emojis.error} Произошла ошибка при получении списка шаблонов. Пожалуйста, попробуйте ещё раз.`;
      return methods.editMessage({
        api: bot.api,
        context,
        message: errorMessage,
      });
    }
  },
});
