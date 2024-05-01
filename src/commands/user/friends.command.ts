import { emojis } from "../../utils/emojies";
import { helpers } from "../../utils/helpers";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export default new Command({
  pattern: /^(?:\+др|\-др)$/i,
  name: "др",
  description: "Добавление/удаление юзера из друзей",

  async handler(context, bot) {
    const action = context.text?.split(" ")[1];
    const userId = await helpers.resolveResourceId(bot.api, context);

    if (userId === context.senderId) {
      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} [id${userId}|Нельзя добавить самого себя в друзья.]`,
      });
      return;
    }

    if (action === "+др") {
      const add = await bot.api.friends.add({ user_id: userId });

      if ([1, 2, 4].includes(add)) {
        await methods.editMessage({
          api: bot.api,
          context,
          message: `${emojis.success} [id${userId}|Добавлен в список друзей.]`,
        });
        return;
      }

      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} [id${userId}|Не удалось добавить в список друзей.]`,
      });
      return;
    } else if (action === "-др") {
      const remove = await bot.api.friends.delete({ user_id: userId });

      if (remove.success || remove.friend_deleted) {
        await methods.editMessage({
          api: bot.api,
          context,
          message: `${emojis.success} [id${userId}|Удалён из списка друзей.]`,
        });
        return;
      }

      if (remove.in_request_deleted) {
        await methods.editMessage({
          api: bot.api,
          context,
          message: `${emojis.warning} [id${userId}|Отклонена входящая заявка в друзья.]`,
        });
        return;
      } else if (remove.out_request_deleted) {
        await methods.editMessage({
          api: bot.api,
          context,
          message: `${emojis.warning} [id${userId}|Отменена исходящая заявка в друзья.]`,
        });
        return;
      }

      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} [id${userId}|Не удалось удалить из списка друзей.]`,
      });
      return;
    }
  },
});
