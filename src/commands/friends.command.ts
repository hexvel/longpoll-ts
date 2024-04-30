import { MessageContext } from "vk-io";
import { IBotContext } from "../context/context.interface";
import { emojis } from "../utils/emojies";
import { helpers } from "../utils/helpers";
import { methods } from "../utils/methods";
import { Command } from "./command.module";

export class FriendCommand extends Command {
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
        `${emojis.warning} [id${userId}|Нельзя добавить самого себя в друзья.]`
      );
      return;
    }

    if (action === "+др") {
      const add = await this.bot.api.friends.add({ user_id: userId });

      if ([1, 2, 4].includes(add)) {
        await methods.editMessage(
          this.bot.api,
          context.peerId,
          context.id,
          `${emojis.success} [id${userId}|Добавлен в список друзей.]`
        );
        return;
      }

      await methods.editMessage(
        this.bot.api,
        context.peerId,
        context.id,
        `${emojis.warning} [id${userId}|Не удалось добавить в список друзей.]`
      );
      return;
    } else if (action === "-др") {
      const remove = await this.bot.api.friends.delete({ user_id: userId });

      if (remove.success || remove.friend_deleted) {
        await methods.editMessage(
          this.bot.api,
          context.peerId,
          context.id,
          `${emojis.success} [id${userId}|Удалён из списка друзей.]`
        );
        return;
      }

      if (remove.in_request_deleted) {
        await methods.editMessage(
          this.bot.api,
          context.peerId,
          context.id,
          `${emojis.warning} [id${userId}|Отклонена входящая заявка в друзья.]`
        );
        return;
      } else if (remove.out_request_deleted) {
        await methods.editMessage(
          this.bot.api,
          context.peerId,
          context.id,
          `${emojis.warning} [id${userId}|Отменена исходящая заявка в друзья.]`
        );
        return;
      }

      await methods.editMessage(
        this.bot.api,
        context.peerId,
        context.id,
        `${emojis.warning} [id${userId}|Не удалось удалить из списка друзей.]`
      );
      return;
    }
  }
}
