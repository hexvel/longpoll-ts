import { emojis } from "../../utils/emojies";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export default new Command({
  pattern: /^(?:пинг|ping)$/i,
  name: "пинг",
  description: "вывод пинга",

  handler: async (context, bot) => {
    const nowInMillis = performance.now();

    await bot.prisma.user.findFirst({});
    const dbLatency = performance.now() - nowInMillis;

    const apiStart = performance.now();
    await methods.editMessage({
      api: bot.api,
      context,
      message: `${emojis.sparkle} Измерение времени API`,
    });
    const apiLatency = performance.now() - apiStart;

    methods.editMessage({
      api: bot.api,
      context,
      message: `🎂 API: ${apiLatency.toFixed(
        2
      )} ms | DB took: ${dbLatency.toFixed(2)} ms`,
    });
  },
});
