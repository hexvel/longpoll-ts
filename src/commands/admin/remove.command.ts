import chalk from "chalk";
import { config } from "../../config/config.service";
import { IBotContext } from "../../context/context.interface";
import { emojis } from "../../utils/emojies";
import { helpers } from "../../utils/helpers";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export default new Command({
  pattern: /^(?:удалить|unreg)$/i,
  name: "удалить",
  description: "Удаление пользователя из бота",

  handler: async (context, bot) => {
    const userId = await helpers.resolveResourceId(bot.api, context);

    if (userId === context.senderId) {
      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} [id${userId}|Вы не можете удалить себя.]`,
      });
      return;
    }

    const user = await bot.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} [id${userId}|Пользователь не найден.]`,
      });
      return;
    }

    await bot.prisma.prefix.delete({ where: { userId } });
    await bot.prisma.user.delete({ where: { id: userId } });

    const configUser = config.get(userId) as IBotContext;
    await configUser.updates.stop();

    console.log(
      chalk.red(
        "User " + chalk.bold.cyan(userId) + " was removed from the bot."
      )
    );

    await methods.editMessage({
      api: bot.api,
      context,
      message: `${emojis.success} [id${userId}|Пользователь успешно удалён.]`,
    });
  },
});
