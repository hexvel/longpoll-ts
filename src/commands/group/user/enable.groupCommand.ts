import { config } from "../../../config/config.service";
import { IGroupContext } from "../../../context/context.interface";
import { emojis } from "../../../utils/emojies";
import { GroupCommand } from "../../command.module";

export default new GroupCommand({
  pattern: /^(?:старт|start)$/i,
  name: "старт",
  description: "запуск бота у пользователя",

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

    if (configUser.updates.isStarted) {
      await context.send(
        `[id${context.senderId}|${emojis.error} Бот уже запущен.]`
      );

      return;
    }

    await configUser.updates.start();

    await context.send(
      `[id${context.senderId}|${emojis.success} Бот запущен.]`
    );
  },
});
