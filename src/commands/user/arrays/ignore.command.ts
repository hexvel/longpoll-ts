import { MessageContext } from "vk-io";
import { IBotContext } from "../../../context/context.interface";
import { IList } from "../../../entities/user.model";
import { emojis } from "../../../utils/emojies";
import { helpers } from "../../../utils/helpers";
import { methods } from "../../../utils/methods";
import { Command } from "../../command.module";

export class IgnoreListCommand extends Command {
  constructor(bot: IBotContext) {
    super(bot);
  }

  async handle(context: MessageContext): Promise<void> {
    const { list } = this.bot.owner!;
    const data = helpers.parsePrismaJSON<IList>(
      list as unknown as IList,
      "ignore"
    );

    const userId = await helpers.resolveResourceId(this.bot.api, context);

    const isUserInList = data.ignore.includes(userId);
    if (isUserInList) {
      const updatedIgnoreList = data.ignore.filter(id => id !== userId);
      const newData = { trust: data.trust, ignore: updatedIgnoreList };

      this.bot.owner.list = newData;
      await this.updateUserList(context.senderId, newData);

      const successMessage = `${emojis.success} [id${userId}|Убран из списка игнора.]`;
      return methods.editMessage({
        api: this.bot.api,
        context,
        message: successMessage,
      });
    } else {
      const newData = { trust: data.trust, ignore: [...data.ignore, userId] };

      this.bot.owner.list = newData;
      await this.updateUserList(context.senderId, newData);

      const successMessage = `${emojis.success} [id${userId}|Добавлен в список игнора.]`;
      return methods.editMessage({
        api: this.bot.api,
        context,
        message: successMessage,
      });
    }
  }

  private async updateUserList(
    senderId: number,
    newData: IList
  ): Promise<void> {
    try {
      await this.bot.prisma.user.update({
        where: {
          id: senderId,
        },
        data: {
          list: {
            ...newData,
          },
        },
      });
    } catch (error) {
      console.error(
        "Ошибка при обновлении списка игнорируемых пользователей:",
        error
      );
    }
  }
}
