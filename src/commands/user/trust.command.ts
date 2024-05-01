import { MessageContext } from "vk-io";
import { IBotContext } from "../../context/context.interface";
import { Command } from "../command.module";

export class TrustListCommand extends Command {
  constructor(bot: IBotContext) {
    super(bot);
  }

  async handle(context: MessageContext): Promise<void> {}
}
