import { MessageContext } from "vk-io";
import { IBotContext } from "../../context/context.interface";
import { IList } from "../../entities/user.model";
import { emojis } from "../../utils/emojies";
import { helpers } from "../../utils/helpers";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export class TrustsListCommand extends Command {
  constructor(bot: IBotContext) {
    super(bot);
  }

  async handle(context: MessageContext): Promise<void> {
    const { trust } = helpers.parsePrismaJSON<IList>(
      this.bot.owner.list as unknown as IList,
      "trust"
    );

    if (!trust || trust.length === 0) {
      const emptyMessage = `${emojis.warning} Список доверенных пользователей пуст.`;
      return methods.editMessage({
        api: this.bot.api,
        context,
        message: emptyMessage,
      });
    }

    const trustData = await this.getUsersInfo(trust);

    const trustListMessage = trustData
      .map(
        user =>
          `[id${user.id}|${emojis.tornado} ${user.first_name} ${user.last_name}]`
      )
      .join("\n");

    const message = `${emojis.bookmark} Список доверенных пользователей:\n${trustListMessage}`;
    methods.editMessage({
      api: this.bot.api,
      context,
      message,
    });
  }

  private async getUsersInfo(userIds: number[]): Promise<any[]> {
    try {
      const trustData = await this.bot.api.users.get({ user_ids: userIds });
      return trustData;
    } catch (error) {
      console.error("Ошибка при получении данных о пользователях:", error);
      return [];
    }
  }
}
