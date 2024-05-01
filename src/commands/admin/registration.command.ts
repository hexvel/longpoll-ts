import chalk from "chalk";
import { MessageContext } from "vk-io";
import { Bot } from "../../app";
import { IBotContext } from "../../context/context.interface";
import { emojis } from "../../utils/emojies";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export class RegistrationCommand extends Command {
  constructor(bot: IBotContext) {
    super(bot);
  }

  async handle(context: MessageContext): Promise<void> {
    await context.loadMessagePayload();

    if (!context.replyMessage || !context.replyMessage.text) {
      await methods.editMessage({
        api: this.bot.api,
        context,
        message: `${emojis.warning} Нужно ответить на сообщение с токеном.`,
      });

      return;
    }

    const { senderId: userId, text: token } = context.replyMessage;

    const user = await this.bot.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user) {
      await methods.editMessage({
        api: this.bot.api,
        context,
        message: `${emojis.warning} [id${userId}|Пользователь уже зарегистрирован.]`,
      });
      return;
    }

    if (token.length < 80) {
      await methods.editMessage({
        api: this.bot.api,
        context,
        message: `${emojis.warning} [id${userId}|Укажите токен.]`,
      });
      return;
    }

    const chekedToken = await methods.checkToken(token);

    if (!chekedToken) {
      await methods.editMessage({
        api: this.bot.api,
        context,
        message: `${emojis.warning} [id${userId}|Некорректный токен.]`,
      });
      return;
    }

    const newUser = await this.bot.prisma.user.create({
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

    const bot = new Bot(this.bot.prisma, newUser);
    await bot.start();

    console.log(
      chalk.green(
        `${emojis.sparkle} Юзер ${chalk.cyan.underline.bold(userId)} запущен`
      )
    );

    await methods.editMessage({
      api: this.bot.api,
      context,
      message: `${emojis.success} [id${userId}|Пользователь успешно зарегистрирован.]`,
    });
  }
}
