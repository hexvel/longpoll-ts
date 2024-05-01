import { MessageContext } from "vk-io";
import { IBotContext } from "../../../context/context.interface";
import { IList } from "../../../entities/user.model";
import { emojis } from "../../../utils/emojies";
import { helpers } from "../../../utils/helpers";
import { methods } from "../../../utils/methods";
import { Command } from "../../command.module";

export class TrustListCommand extends Command {
  constructor(bot: IBotContext) {
    super(bot);
  }

  async handle(context: MessageContext): Promise<void> {
    const { list } = this.bot.owner!;
    const data = helpers.parsePrismaJSON<IList>(
      list as unknown as IList,
      "trust"
    );

    const userId = await helpers.resolveResourceId(this.bot.api, context);

    const isUserInList = data.trust.includes(userId);
    if (isUserInList) {
      const updatedTrustList = data.trust.filter(id => id !== userId);
      const newData = { trust: updatedTrustList, ignore: data.ignore };

      this.bot.owner.list = newData;
      await this.updateUserList(context.senderId, newData);

      const successMessage = `${emojis.success} [id${userId}|Убран из списка доверенных.]`;
      return methods.editMessage({
        api: this.bot.api,
        context,
        message: successMessage,
      });
    } else {
      const newData = { trust: [...data.trust, userId], ignore: data.ignore };

      this.bot.owner.list = newData;
      await this.updateUserList(context.senderId, newData);

      const successMessage = `${emojis.success} [id${userId}|Добавлен в список доверенных.]`;
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
        "Ошибка при обновлении списка доверенных пользователей:",
        error
      );
    }
  }
}
