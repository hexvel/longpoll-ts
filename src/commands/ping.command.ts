import { MessageContext } from "vk-io";
import { IBotContext } from "../context/context.interface";
import { methods } from "../utils/methods";
import { Command } from "./command.module";

export class PingCommand extends Command {
  constructor(bot: IBotContext) {
    super(bot);
  }

  handle(context: MessageContext): void {
    methods.editMessage(
      this.bot.api,
      context.peerId,
      context.id,
      `🎂 PingTime: ${Date.now() - context.createdAt * 1000} ms.`
    );
  }
}
