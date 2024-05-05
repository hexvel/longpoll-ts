import { config } from "../../../config/config.service";
import { IGroupContext } from "../../../context/context.interface";
import { emojis } from "../../../utils/emojies";
import { GroupCommand } from "../../command.module";

export default new GroupCommand({
  pattern: /^(?:стоп|stop)$/i,
  name: "стоп",
  description: "остановка бота у пользователя",

  handler: async (context, bot) => {
    const user = await bot.prisma.user.findUnique({
      where: {
        id: context.senderId,
      },
    });

    if (!user) {
      await context.send(
        `[id${context.senderId}|${emojis.error} Вы не зарегистрированы.]`
      );

      return;
    }

    const configUser = config.get(context.senderId) as IGroupContext;

    if (!configUser.updates.isStarted) {
      await context.send(
        `[id${context.senderId}|${emojis.error} Бот уже отключён.]`
      );

      return;
    }

    await configUser.updates.stop();

    await context.send(
      `[id${context.senderId}|${emojis.success} Бот отключён.]`
    );
  },
});
