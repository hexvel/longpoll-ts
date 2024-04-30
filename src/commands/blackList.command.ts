import { MessageContext } from "vk-io";
import { IBotContext } from "../context/context.interface";
import { emojis } from "../utils/emojies";
import { helpers } from "../utils/helpers";
import { methods } from "../utils/methods";
import { Command } from "./command.module";

export class BlackListCommand extends Command {
  constructor(bot: IBotContext) {
    super(bot);
  }

  async handle(context: MessageContext): Promise<void> {
    const action = context.text?.split(" ")[1];
    const userId = await helpers.resolveResourceId(this.bot.api, context);

    if (userId === context.senderId) {
      await methods.editMessage(
        this.bot.api,
        context.peerId,
        context.id,
        `${emojis.warning} [id${userId}|Вы не можете заблокировать себя.]`
      );
      return;
    }

    if (action === "+чс") {
      const add = await this.bot.api.account.ban({ owner_id: userId });

      if (add === 1) {
        await methods.editMessage(
          this.bot.api,
          context.peerId,
          context.id,
          `${emojis.success} [id${userId}|Добавлен в чёрный список.]`
        );
        return;
      }

      await methods.editMessage(
        this.bot.api,
        context.peerId,
        context.id,
        `${emojis.warning} [id${userId}|Не удалось добавить в чёрный список.]`
      );
      return;
    } else if (action === "-чс") {
      const remove = await this.bot.api.account.unban({ owner_id: userId });

      if (remove === 1) {
        await methods.editMessage(
          this.bot.api,
          context.peerId,
          context.id,
          `${emojis.success} [id${userId}|Исключён из чёрного списка.]`
        );
        return;
      }

      await methods.editMessage(
        this.bot.api,
        context.peerId,
        context.id,
        `${emojis.warning} [id${userId}|Не удалось исключить из чёрного списка.]`
      );
      return;
    }
  }
}
