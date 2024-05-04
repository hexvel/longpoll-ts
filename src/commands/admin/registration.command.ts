import chalk from "chalk";
import { BotApp } from "../../app";
import { emojis } from "../../utils/emojies";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export default new Command({
  pattern: /^(?:рег|reg)$/i,
  name: "рег",
  description: "Регистрация нового пользователя",

  handler: async (context, bot) => {
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

    if (!chekedToken.isOk) {
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
        token: chekedToken.token,
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

    const botApp = new BotApp(bot.prisma, [newUser]);
    await botApp.run();

    console.log(
      chalk.green(
        `${emojis.sparkle} User ${chalk.cyan.underline.bold(
          userId
        )} successfully registered`
      )
    );

    await methods.editMessage({
      api: bot.api,
      context,
      message: `${emojis.success} [id${userId}|Пользователь успешно зарегистрирован.]`,
    });
  },
});
