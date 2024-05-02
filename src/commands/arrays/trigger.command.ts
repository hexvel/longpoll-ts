import { emojis } from "../../utils/emojies";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export default new Command({
  pattern: /^(?:\+триггер|\-триггер)$/i,
  name: "триггер",
  description: "Добавление/удаление слова-триггера и соответствующего ответа",

  handler: async (context, bot) => {
    const [, action, ...rest] = context.text?.split(" ")!;
    const [word, ...answerArray] = rest;
    const answer = answerArray.join(" ");

    if (action === "+триггер") {
      try {
        await bot.prisma.trigger.create({
          data: {
            id: context.senderId,
            name: word,
            word,
            answer,
          },
        });

        const successMessage = `${emojis.success} Триггер "${word}" успешно добавлен.`;
        return methods.editMessage({
          api: bot.api,
          context,
          message: successMessage,
        });
      } catch (error) {
        const errorMessage = `${emojis.error} Произошла ошибка при добавлении триггера. Пожалуйста, попробуйте ещё раз.`;
        return methods.editMessage({
          api: bot.api,
          context,
          message: errorMessage,
        });
      }
    } else if (action === "-триггер") {
      try {
        const deletedTrigger = await bot.prisma.trigger.delete({
          where: {
            id: context.senderId,
            name: word,
          },
        });

        const successMessage = `${emojis.success} Триггер "${deletedTrigger.name}" успешно удалён.`;
        return methods.editMessage({
          api: bot.api,
          context,
          message: successMessage,
        });
      } catch (error) {
        const errorMessage = `${emojis.error} Произошла ошибка при удалении триггера. Пожалуйста, попробуйте ещё раз.`;
        return methods.editMessage({
          api: bot.api,
          context,
          message: errorMessage,
        });
      }
    }
  },
});
