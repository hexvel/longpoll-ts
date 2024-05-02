import chalk from "chalk";
import { Bot } from "../../bot";
import { emojis } from "../../utils/emojies";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export default new Command({
  pattern: /^(?:рег|reg)$/i,
  name: "рег",
  description: "Регистрация нового пользователя",

  handler: async (context, bot) => {
    await context.loadMessagePayload();

    if (!context.replyMessage || !context.replyMessage.text) {
      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} Нужно ответить на сообщение с токеном.`,
      });

      return;
    }

    const { senderId: userId, text: token } = context.replyMessage;

    const user = await bot.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user) {
      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} [id${userId}|Пользователь уже зарегистрирован.]`,
      });
      return;
    }

    if (token.length < 80) {
      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} [id${userId}|Укажите токен.]`,
      });
      return;
    }

    const chekedToken = await methods.checkToken(token);

    if (!chekedToken) {
      await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} [id${userId}|Некорректный токен.]`,
      });
      return;
    }

    const newUser = await bot.prisma.user.create({
      data: {
        id: userId,
        token,
        prefix: {
          create: {
            id: userId,
          },
        },
      },
      include: {
        prefix: true,
      },
    });

    const botObj = new Bot(bot, newUser, bot.prisma);
    await botObj.start();

    console.log(
      chalk.green(
        `${emojis.sparkle} Юзер ${chalk.cyan.underline.bold(userId)} запущен`
      )
    );

    await methods.editMessage({
      api: bot.api,
      context,
      message: `${emojis.success} [id${userId}|Пользователь успешно зарегистрирован.]`,
    });
  },
});
