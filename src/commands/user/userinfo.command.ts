import { MessageContext } from "vk-io";
import { IBotContext } from "../../context/context.interface";
import { emojis } from "../../utils/emojies";
import { helpers } from "../../utils/helpers";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export class UserInfoCommand extends Command {
  constructor(bot: IBotContext) {
    super(bot);
  }

  async handle(context: MessageContext): Promise<void> {
    const userId = await helpers.resolveResourceId(this.bot.api, context);

    const ranks: { [key: number]: string } = {
      5: "Разработчик",
      4: "Админ",
      3: "Модератор",
      2: "Работник",
      1: "Пользователь",
    };

    const userData = await this.bot.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        prefix: true,
      },
    });

    if (!userData) {
      await methods.editMessage({
        api: this.bot.api,
        context,
        message: `${emojis.warning} [id${userId}|Пользователь не найден.]`,
      });
      return;
    }

    const message = `
${emojis.vampireWoman} Информация о [id${userId}|пользователе]
${emojis.waterWave} Ранг: ${ranks[userData.rank]}
${emojis.heart} Никнейм: ${userData.username}
${emojis.id} ID: ${userData.id}
${emojis.inboxTray} Сквад: ${userData.squad}

${emojis.key} Информация о префиксах:
${emojis.globeWithMeridians} Префикс команд: ${userData.prefix?.command}
${emojis.cloud} Префикс скриптов: ${userData.prefix?.script}
${emojis.bomb} Префикс админки: ${userData.prefix?.admin}
    `.trim();

    methods.editMessage({
      api: this.bot.api,
      context,
      message,
      attachments: this.bot.owner.cover_image,
    });
  }
}
