import { emojis } from "../../utils/emojies";
import { helpers } from "../../utils/helpers";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export default new Command({
  pattern: /^(?:кик|kick)$/i,
  name: "кик",
  description: "Удаление участника из чата",

  handler: async (context, bot) => {
    const userId = await helpers.resolveResourceId(bot.api, context);

    if (userId === context.senderId) {
      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} [id${userId}|Вы не можете исключить себя из чата.]`,
      });
      return;
    }

    try {
      await bot.api.messages.removeChatUser({
        chat_id: context.chatId!,
        user_id: userId,
      });
      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.success} [id${userId}|Исклюён из чата.]`,
      });
    } catch {
      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} [id${userId}|Не удалось исключить участника из чата.]`,
      });
    }
  },
});
