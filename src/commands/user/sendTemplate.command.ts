import { getRandomId } from "vk-io";
import { emojis } from "../../utils/emojies";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

export default new Command({
  pattern: /^(?:шаб|template)$/i,
  name: "шаб",
  description: "Отправка шаблона",
  handler: async (context, bot) => {
    const [_, ...rest] = context.text?.split(" ")!;
    const [__, ...ctxArray] = rest;
    const name = ctxArray.join(" ");

    if (!name) {
      return await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.warning} Нужно указать имя шаблона.`,
      });
    }

    const template = await bot.prisma.template.findFirst({
      where: {
        id: context.senderId,
        name,
      },
    });

    if (!template) {
      return await methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.error} Шаблон не найден.`,
      });
    }

    const message = await bot.api.messages.getHistory({
      peer_id: context.senderId,
      count: 1,
      start_message_id: template.cmid,
    });

    await bot.api.messages.delete({
      peer_id: context.peerId,
      message_ids: context.id,
      delete_for_all: true,
    });

    const attachment = message.items[0].attachments
      .map(
        obj =>
          `${obj.type}${obj.photo.owner_id}_${obj.photo.id}_${obj.photo.access_key}`
      )
      .join("");

    await bot.api.messages.send({
      peer_id: context.peerId,
      message: message.items[0].text,
      attachment: attachment,
      random_id: getRandomId(),
    });
  },
});
