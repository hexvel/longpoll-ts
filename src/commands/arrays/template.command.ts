import { Attachment, ExternalAttachment, MessageContext } from "vk-io";
import { IBotContext } from "../../context/context.interface";
import { emojis } from "../../utils/emojies";
import { helpers } from "../../utils/helpers";
import { methods } from "../../utils/methods";
import { Command } from "../command.module";

async function addTemplate(
  context: MessageContext,
  bot: IBotContext,
  name: string,
  attachments: (
    | Attachment<object, string>
    | ExternalAttachment<object, string>
  )[],
  text: string
) {
  const template = await context.send(text, {
    user_id: context.senderId,
    attachment: attachments && attachments.join(","),
  });

  await bot.prisma.template.create({
    data: {
      id: context.senderId,
      name,
      cmid: template.id,
    },
  });

  return template;
}

async function deleteTemplate(
  context: MessageContext,
  bot: IBotContext,
  name: string
) {
  const template = await bot.prisma.template.findFirst({
    where: {
      id: context.senderId,
      name,
    },
  });

  if (!template) {
    throw new Error(`Шаблон "${name}" не найден.`);
  }

  await bot.api.messages.delete({
    message_ids: template.cmid,
    peer_id: context.senderId,
  });

  await bot.prisma.template.delete({
    where: {
      id: context.senderId,
      name,
    },
  });
}

export default new Command({
  pattern: /^(?:\+шаб|\-шаб|\-шабы)$/i,
  name: "template",
  description: "Добавление/удаление шаблона",
  handler: async (context, bot) => {
    await context.loadMessagePayload();

    const { action, sub: name } = await helpers.getAfterSplit(context.text!);

    if (action === "+шаб") {
      if (!context.replyMessage) {
        throw new Error("Нужно ответить на сообщение с шаблоном.");
      }

      const { attachments, text } = context.replyMessage;

      const isExists = await bot.prisma.template.findFirst({
        where: {
          id: context.senderId,
          name,
        },
      });

      if (isExists) {
        throw new Error(`Вы уже добавляли шаблон "${name}".`);
      }

      await addTemplate(context, bot, name, attachments, text!);

      return methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.success} Шаблон "${name}" успешно добавлен.`,
      });
    } else if (action === "-шаб") {
      await deleteTemplate(context, bot, name);

      return methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.success} Шаблон "${name}" успешно удален.`,
      });
    } else if (action === "-шабы") {
      const templates = await bot.prisma.template.findMany({
        where: {
          id: context.senderId,
        },
      });

      if (templates.length === 0) {
        throw new Error("Вы ещё не добавляли ни одного шаблона.");
      }

      await bot.prisma.template.deleteMany({
        where: {
          id: context.senderId,
        },
      });

      return methods.editMessage({
        api: bot.api,
        context,
        message: `${emojis.success} Шаблоны успешно удалены.`,
      });
    }
  },
});
