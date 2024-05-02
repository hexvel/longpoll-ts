import { IList } from "../../entities/user.model";
import { emojis } from "../../utils/emojies";
import { helpers } from "../../utils/helpers";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export default new Command({
  pattern: /^(?:игнор|ignore)$/i,
  name: "игнор",
  description: "Добавление/удаление юзера из игнора",

  handler: async (context, bot) => {
    const { list } = bot.owner;
    const data = helpers.parsePrismaJSON<IList>(
      list as unknown as IList,
      "ignore"
    );

    const userId = await helpers.resolveResourceId(bot.api, context);

    const isUserInList = data.ignore.includes(userId);

    if (isUserInList) {
      const updatedIgnoreList = data.ignore.filter(id => id !== userId);
      const newData = { trust: data.trust, ignore: updatedIgnoreList };

      bot.owner.list = newData;

      await helpers.updateUserList(bot, context.senderId, newData);

      const successMessage = `${emojis.success} [id${userId}|Убран из списка игнора.]`;

      return methods.editMessage({
        api: bot.api,
        context,
        message: successMessage,
      });
    } else {
      const newData = { trust: data.trust, ignore: [...data.ignore, userId] };

      bot.owner.list = newData;

      await helpers.updateUserList(bot, context.senderId, newData);

      const successMessage = `${emojis.success} [id${userId}|Добавлен в список игнора.]`;

      return methods.editMessage({
        api: bot.api,
        context,
        message: successMessage,
      });
    }
  },
});
