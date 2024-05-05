// Command.ts
import { MessageContext } from "vk-io";
import { IBotContext, IGroupContext } from "../context/context.interface";

export interface ICommand {
  pattern: RegExp;
  name: string;
  description: string;
  handler(
    context: MessageContext,
    bot: IBotContext | IGroupContext
  ): void | Promise<void>;
}

export class Command implements ICommand {
  pattern: RegExp;
  name: string;
  description: string;
  handler: (context: MessageContext, bot: IBotContext) => void | Promise<void>;

  constructor({
    pattern,
    name,
    description,
    handler,
  }: {
    pattern: RegExp;
    name: string;
    description: string;
    handler: (
      context: MessageContext,
      bot: IBotContext
    ) => void | Promise<void>;
  }) {
    this.pattern = pattern;
    this.name = name;
    this.description = description;
    this.handler = handler;
  }
}

export class GroupCommand implements ICommand {
  pattern: RegExp;
  name: string;
  description: string;
  handler: (
    context: MessageContext,
    bot: IGroupContext
  ) => void | Promise<void>;

  constructor({
    pattern,
    name,
    description,
    handler,
  }: {
    pattern: RegExp;
    name: string;
    description: string;
    handler: (
      context: MessageContext,
      bot: IGroupContext
    ) => void | Promise<void>;
  }) {
    this.pattern = pattern;
    this.name = name;
    this.description = description;
    this.handler = handler;
  }
}
