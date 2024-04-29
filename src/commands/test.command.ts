import { getRandomId, MessageContext } from "vk-io";
import { IBotContext } from "../context/context.interface";
import { Command } from "./command.module";

export class TestCommand extends Command {
  constructor(bot: IBotContext) {
    super(bot);
  }

  handle(context: MessageContext): void {
    console.log(context);

    this.bot.api.messages.send({
      peer_id: context.peerId,
      message: "Test",
      random_id: getRandomId(),
    });
  }
}
