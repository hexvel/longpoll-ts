import { emojis } from "../../../utils/emojies";
import { GroupCommand } from "../../command.module";

export default new GroupCommand({
  pattern: /^(?:пинг|ping)$/i,
  name: "пинг",
  description: "вывод пинга у группы",

  handler: async (context, bot) => {
    const nowInMillis = performance.now();

    await bot.prisma.user.findFirst({});
    const dbLatency = performance.now() - nowInMillis;

    const apiStart = performance.now();
    const message = await context.send(
      `${emojis.sparkle} Измерение времени API`
    );
    const apiLatency = performance.now() - apiStart;

    await bot.api.messages.edit({
      cmid: message.conversationMessageId,
      peer_id: context.peerId,
      message: `🎂 API: ${apiLatency.toFixed(
        2
      )} ms | DB took: ${dbLatency.toFixed(2)} ms`,
    });
  },
});
