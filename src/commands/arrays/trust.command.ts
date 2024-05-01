import { IList } from "../../entities/user.model";
import { emojis } from "../../utils/emojies";
import { helpers } from "../../utils/helpers";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export default new Command({
  pattern: /^(?:дов|trust)$/i,
  name: "дов",
  description: "Добавление/удаление юзера из игнора",

  async handler(context, bot) {
    const { list } = bot.owner!;
    const data = helpers.parsePrismaJSON<IList>(
      list as unknown as IList,
      "trust"
    );

    const userId = await helpers.resolveResourceId(bot.api, context);

    const isUserInList = data.trust.includes(userId);
    if (isUserInList) {
      const updatedTrustList = data.trust.filter(id => id !== userId);
      const newData = { trust: updatedTrustList, ignore: data.ignore };

      bot.owner.list = newData;

      await helpers.updateUserList(bot, context.senderId, newData);

      const successMessage = `${emojis.success} [id${userId}|Убран из списка доверенных.]`;

      return methods.editMessage({
        api: bot.api,
        context,
        message: successMessage,
      });
    } else {
      const newData = { trust: [...data.trust, userId], ignore: data.ignore };

      bot.owner.list = newData;

      await helpers.updateUserList(bot, context.senderId, newData);

      const successMessage = `${emojis.success} [id${userId}|Добавлен в список доверенных.]`;

      return methods.editMessage({
        api: bot.api,
        context,
        message: successMessage,
      });
    }
  },
});
