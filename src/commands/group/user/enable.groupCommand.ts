import { config } from "../../../config/config.service";
import { IGroupContext } from "../../../context/context.interface";
import { emojis } from "../../../utils/emojies";
import { GroupCommand } from "../../command.module";

export default new GroupCommand({
  pattern: /^(?:старт|start)$/i,
  name: "старт",
  description: "запуск бота у пользователя",

  handler: async (context, bot) => {
    const data = await bot.prisma.user.findUnique({
      where: {
        id: context.senderId,
      },
    });

    if (!data) {
      await context.send(
        `[id${context.senderId}|${emojis.error} Вы не зарегистрированы.]`
      );

      return;
    }

    const user = config.get(context.senderId) as IGroupContext;

    if (user.updates.isStarted) {
      await context.send(
        `[id${context.senderId}|${emojis.error} Бот уже запущен.]`
      );

      return;
    }

    // @ts-expect-error non standard behavior
    user.updates.pollingTransport.ts = 0;
    await user.updates.start();

    await context.send(
      `[id${context.senderId}|${emojis.success} Бот запущен.]`
    );
  },
});
