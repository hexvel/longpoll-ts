import { Context } from "vk-io";
import { IBotContext } from "../context/context.interface";

export abstract class Command {
  constructor(public bot: IBotContext) {}

  abstract handle(context?: Context): Promise<void>;
}
