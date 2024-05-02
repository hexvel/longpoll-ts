import { emojis } from "../../utils/emojies";
import { helpers } from "../../utils/helpers";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export default new Command({
  pattern: /^(?:\+чс|\-чс)$/i,
  name: "+чс|-чс",
  description: "Добавление/удаление юзера из чс",

  handler: async (context, bot) => {
    const action = context.text?.split(" ")[1];
    const userId = await helpers.resolveResourceId(bot.api, context);

    if (userId === context.senderId) {
      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} [id${userId}|Вы не можете заблокировать себя.]`,
      });
      return;
    }

    if (action === "+чс") {
      const add = await bot.api.account.ban({ owner_id: userId });

      if (add === 1) {
        await methods.editMessage({
          api: bot.api,
          context,
          message: `${emojis.success} [id${userId}|Добавлен в чёрный список.]`,
        });
        return;
      }

      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} [id${userId}|Не удалось добавить в чёрный список.]`,
      });
      return;
    } else if (action === "-чс") {
      const remove = await bot.api.account.unban({ owner_id: userId });

      if (remove === 1) {
        await methods.editMessage({
          api: bot.api,
          context,
          message: `${emojis.success} [id${userId}|Исключён из чёрного списка.]`,
        });
        return;
      }

      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} [id${userId}|Не удалось исключить из чёрного списка.]`,
      });
      return;
    }
  },
});
