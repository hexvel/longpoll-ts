import { MessageContext } from "vk-io";
import { IBotContext } from "../../context/context.interface";
import { emojis } from "../../utils/emojies";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export class UsernameCommand extends Command {
  constructor(bot: IBotContext) {
    super(bot);
  }

  async handle(context: MessageContext): Promise<void> {
    const { text } = context;
    if (!text) return;

    const [_, __, username] = text.split(" ");

    if (!username) {
      await methods.editMessage({
        api: this.bot.api,
        context,
        message: `${emojis.warning} Не указан юзернейм. Пример: .н ник <новый ник>`,
      });

      return;
    }

    if (username.length > 25 || username.length < 3) {
      await methods.editMessage({
        api: this.bot.api,
        context,
        message: `${emojis.warning} Ник должен содержать от 3 до 25 символов.`,
      });

      return;
    }

    await this.bot.prisma.user.update({
      where: {
        id: context.senderId,
      },
      data: {
        username,
      },
    });

    await methods.editMessage({
      api: this.bot.api,
      context,
      message: `${emojis.success} Ник изменен на ['${username}'].`,
    });
  }
}
