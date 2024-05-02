import { IList } from "../../entities/user.model";
import { emojis } from "../../utils/emojies";
import { helpers } from "../../utils/helpers";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export default new Command({
  pattern: /^(?:игноры|ignores)$/i,
  name: "игноры",
  description: "Вывод списка юзеров из игнора",

  handler: async (context, bot) => {
    const { ignore } = helpers.parsePrismaJSON<IList>(
      bot.owner.list as unknown as IList,
      "ignore"
    );

    if (!ignore || ignore.length === 0) {
      const emptyMessage = `${emojis.warning} Список игнорируемых пользователей пуст.`;

      return methods.editMessage({
        api: bot.api,
        context,
        message: emptyMessage,
      });
    }
    const ignoreData = await bot.api.users.get({ user_ids: ignore });

    const ignoreListMessage = ignoreData
      .map(
        user =>
          `[id${user.id}|${emojis.tornado} ${user.first_name} ${user.last_name}]`
      )
      .join("\n");

    const message = `${emojis.bookmark} Список игнорируемых пользователей:\n${ignoreListMessage}`;

    methods.editMessage({
      api: bot.api,
      context,
      message,
    });
  },
});
