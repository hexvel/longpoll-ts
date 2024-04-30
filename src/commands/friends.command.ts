import { MessageContext } from "vk-io";
import { IBotContext } from "../context/context.interface";
import { helpers } from "../utils/helpers";
import { methods } from "../utils/methods";
import { Command } from "./command.module";

export class FriendCommand extends Command {
  constructor(bot: IBotContext) {
    super(bot);
  }

  async handle(context: MessageContext): Promise<void> {
    const action = context.text?.split(" ")[1];
    const userId = await helpers.resolveResourceId(this.bot.api, context);

    if (userId === context.senderId) {
      return methods.editMessage(
        this.bot.api,
        context.peerId,
        context.id,
        "You can't add yourself as a friend."
      );
    }

    if (action === "+") {
      this.bot.api.friends.add({
        user_id: context.peerId,
      });
    }

    methods.editMessage(this.bot.api, context.peerId, context.id, ``);
  }
}
