import { MessageContext } from "vk-io";
import { IBotContext, IGroupContext } from "../context/context.interface";

type CommandHandler = (
  context: MessageContext,
  bot: IBotContext | IGroupContext
) => void | Promise<void>;

export interface CommandRegistration {
  pattern: string | RegExp;
  name: string;
  description: string;
  handler: CommandHandler;
}
