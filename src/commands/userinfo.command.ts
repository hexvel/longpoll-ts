import { MessageContext } from "vk-io";
import { IBotContext } from "../context/context.interface";
import { emojis } from "../utils/emojies";
import { helpers } from "../utils/helpers";
import { methods } from "../utils/methods";
import { Command } from "./command.module";

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

    const message = `
    ${emojis.vampireWoman} Информация о [id${userId}|пользователе]
    ${emojis.waterWave} Ранг: ${ranks[this.bot.owner.rank]}
    ${emojis.heart} Никнейм: ${this.bot.owner.username}
    ${emojis.id} ID: ${this.bot.owner.id}
    ${emojis.inboxTray} Сквад: ${this.bot.owner.squad}

    ${emojis.key} Информация и префиксах:
    ${emojis.globeWithMeridians} Префикс команд: ${this.bot.owner.commandPrefix}
    ${emojis.cloud} Префикс скриптов: ${this.bot.owner.scriptPrefix}
    ${emojis.bomb} Префикс админки: ${this.bot.owner.adminPrefix}
    `;

    methods.editMessage({
      api: this.bot.api,
      context,
      message,
      attachments: this.bot.owner.cover_image,
    });
  }
}
