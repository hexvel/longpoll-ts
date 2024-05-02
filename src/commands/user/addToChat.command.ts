import { emojis } from "../../utils/emojies";
import { helpers } from "../../utils/helpers";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export default new Command({
  pattern: /^(?:добавить|add)$/i,
  name: "добавить",
  description: "Добавление юзера в чат",

  handler: async (context, bot) => {
    const userId = await helpers.resolveResourceId(bot.api, context);

    if (userId === context.senderId) {
      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} [id${userId}|Вы не можете добавить себя в чат.]`,
      });

      return;
    }

    try {
      await bot.api.messages.addChatUser({
        chat_id: context.chatId!,
        user_id: userId,
      });
      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.success} [id${userId}|Добавлен в чат.]`,
      });
    } catch {
      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} [id${userId}|Не удалось добавить нового участника.]`,
      });
    }
  },
});
