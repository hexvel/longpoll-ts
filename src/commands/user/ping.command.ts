import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export default new Command({
  pattern: /^(?:пинг|ping)$/i,
  name: "пинг",
  description: "вывод пинга",

  async handler(context, bot) {
    methods.editMessage({
      api: bot.api,
      context,
      message: `🎂 Сообщения обработались за ${
        Date.now() - context.createdAt * 1000
      }мс.`,
    });
  },
});
