import { IList } from "../../entities/user.model";
import { emojis } from "../../utils/emojies";
import { helpers } from "../../utils/helpers";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export default new Command({
  pattern: /^(?:довы|trusts)$/i,
  name: "довы",
  description: "Вывод списка юзеров из дова",

  async handler(context, bot) {
    const { trust } = helpers.parsePrismaJSON<IList>(
      bot.owner.list as unknown as IList,
      "trust"
    );

    if (!trust || trust.length === 0) {
      const emptyMessage = `${emojis.warning} Список доверенных пользователей пуст.`;

      return methods.editMessage({
        api: bot.api,
        context,
        message: emptyMessage,
      });
    }
    const trustData = await bot.api.users.get({ user_ids: trust });

    const trustListMessage = trustData
      .map(
        user =>
          `[id${user.id}|${emojis.tornado} ${user.first_name} ${user.last_name}]`
      )
      .join("\n");

    const message = `${emojis.bookmark} Список доверенных пользователей:\n${trustListMessage}`;

    methods.editMessage({
      api: bot.api,
      context,
      message,
    });
  },
});
