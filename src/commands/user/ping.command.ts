import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export default new Command({
  pattern: /^(?:пинг|ping)$/i,
  name: "пинг",
  description: "вывод пинга",

  async handler(context, bot) {
    const now = Date.now();
    const ping = now - context.createdAt * 1000;

    methods.editMessage({
      api: bot.api,
      context,
      message: `🎂 Сообщения обработались за ${ping % 1000}мс.`,
    });
  },
});
