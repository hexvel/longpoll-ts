import { emojis } from "../../utils/emojies";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export default new Command({
  pattern: /^(?:пинг|ping)$/i,
  name: "пинг",
  description: "вывод пинга",

  handler: async (context, bot) => {
    const nowInMillis = Date.now();

    await bot.prisma.user.findFirst({});
    const dbLatency = Date.now() - nowInMillis;

    const apiStart = Date.now();
    await methods.editMessage({
      api: bot.api,
      context,
      message: `${emojis.sparkle} Измерение времени API`,
    });
    const apiLatency = Date.now() - apiStart;

    methods.editMessage({
      api: bot.api,
      context,
      message: `🎂 API: ${apiLatency} ms | DB took: ${dbLatency} ms`,
    });
  },
});
