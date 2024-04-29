import { getRandomId } from "vk-io";
import { IBotContext } from "../context/context.interface";
import { Command } from "./command.class";

export class TestCommand extends Command {
  constructor(bot: IBotContext) {
    super(bot);
  }

  handle(): void {
    this.bot.api.messages.send({
      peer_id: 715616525,
      message: "Test",
      random_id: getRandomId(),
    });
  }
}
