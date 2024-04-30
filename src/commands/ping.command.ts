import { MessageContext } from "vk-io";
import { IBotContext } from "../context/context.interface";
import { methods } from "../utils/methods";
import { Command } from "./command.module";

export class PingCommand extends Command {
  constructor(bot: IBotContext) {
    super(bot);
  }

  handle(context: MessageContext): void {
    const start = Date.now();
    this.bot.prisma.user.findFirst({ where: { id: context.senderId } });
    const end = Date.now();

    methods.editMessage(
      this.bot.api,
      context.peerId,
      context.id,
      `🎂 Сообщения обработались за ${
        Date.now() - context.createdAt * 1000
      } мс | Скорость бд ${end - start}мс.`
    );
  }
}
