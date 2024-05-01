import { MessageContext } from "vk-io";
import { IBotContext } from "../../../context/context.interface";
import { IList } from "../../../entities/user.model";
import { emojis } from "../../../utils/emojies";
import { helpers } from "../../../utils/helpers";
import { methods } from "../../../utils/methods";
import { Command } from "../../command.module";

export class IgnoresListCommand extends Command {
  constructor(bot: IBotContext) {
    super(bot);
  }

  async handle(context: MessageContext): Promise<void> {
    const { ignore } = helpers.parsePrismaJSON<IList>(
      this.bot.owner.list as unknown as IList,
      "ignore"
    );

    if (!ignore || ignore.length === 0) {
      const emptyMessage = `${emojis.warning} Список игнорируемых пользователей пуст.`;
      return methods.editMessage({
        api: this.bot.api,
        context,
        message: emptyMessage,
      });
    }

    const trustData = await this.getUsersInfo(ignore);

    const trustListMessage = trustData
      .map(
        user =>
          `[id${user.id}|${emojis.tornado} ${user.first_name} ${user.last_name}]`
      )
      .join("\n");

    const message = `${emojis.bookmark} Список игнорируемых пользователей:\n${trustListMessage}`;

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
