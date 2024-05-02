import { emojis } from "../../utils/emojies";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export default new Command({
  pattern: /^(?:ник|nick)$/i,
  name: "ник",
  description: "Изменение никнейма",

  handler: async (context, bot) => {
    const { text } = context;
    if (!text) return;

    const [_, __, username] = text.split(" ");

    if (!username) {
      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} Не указан юзернейм. Пример: .н ник <новый ник>`,
      });

      return;
    }

    if (username.length > 25 || username.length < 3) {
      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} Ник должен содержать от 3 до 25 символов.`,
      });

      return;
    }

    await bot.prisma.user.update({
      where: {
        id: context.senderId,
      },
      data: {
        username,
      },
    });

    await methods.editMessage({
      api: bot.api,
      context,
      message: `${emojis.success} Ник изменен на ['${username}'].`,
    });
  },
});
