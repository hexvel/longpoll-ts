import { PrismaClient } from "@prisma/client";
import { MessageContext } from "vk-io";
import { IBotContext } from "./context/context.interface";
import { IList, UserModel } from "./entities/user.model";
import { helpers } from "./utils/helpers";

type CommandHandler = (
  context: MessageContext,
  bot: IBotContext
) => void | Promise<void>;

interface CommandRegistration {
  pattern: string | RegExp;
  handler: CommandHandler;
}

export class Bot {
  private readonly bot: IBotContext;
  public readonly commands: CommandRegistration[] = [];

  constructor(
    botContext: IBotContext,
    user: UserModel,
    prismaClient: PrismaClient
  ) {
    this.bot = botContext;
    this.bot.prisma = prismaClient;
    this.bot.owner = user;

    this.setupEventHandlers();
  }

  public async start(): Promise<void> {
    try {
      this.bot.updates.start();
      await this.bot.prisma.$connect();
    } catch (error) {
      console.error("Error starting bot:", error);
      process.exit(1);
    }
  }

  public registerCommand(
    pattern: string | RegExp,
    handler: CommandHandler
  ): void {
    this.commands.push({ pattern, handler });
  }

  public async handleIncomingMessage(context: MessageContext): Promise<void> {
    try {
      await context.loadMessagePayload();
      await this.checkIgnoreUsers(context);
      await this.checkTrustUsers(context);

      if (context.senderId !== this.bot.owner.id) return;

      await this.handleUserNewMessage(context);
      await this.handleAdminNewMessage(context);
    } catch (error) {
      console.error("Error handling new message:", error);
    }
  }

  private setupEventHandlers(): void {
    this.bot.updates.on(
      "message_new",
      async (context: MessageContext, next: () => void) => {
        await this.handleIncomingMessage(context);
        next();
      }
    );
  }

  private async checkIgnoreUsers(context: MessageContext): Promise<void> {
    const { ignore } = helpers.parsePrismaJSON<IList>(
      this.bot.owner.list as unknown as IList,
      "ignore"
    );

    if (ignore.includes(context.senderId)) {
      await this.bot.api.messages.delete({
        cmids: context.conversationMessageId,
      });
    }
  }

  private async checkTrustUsers(context: MessageContext): Promise<void> {
    const { trust } = helpers.parsePrismaJSON<IList>(
      this.bot.owner.list as unknown as IList,
      "trust"
    );

    if (context.text?.startsWith("#") && trust.includes(context.senderId)) {
      await context.send(context.text.replace("#", ""));
    }
  }

  private async handleUserNewMessage(context: MessageContext): Promise<void> {
    const [prefix, command] = context.text?.split(" ") || [];

    if (prefix !== this.bot.owner.prefix?.command) return;

    for (const { pattern, handler } of this.commands) {
      if (typeof pattern === "string" && command === pattern) {
        await handler(context, this.bot);
        return;
      } else if (pattern instanceof RegExp && pattern.test(command || "")) {
        await handler(context, this.bot);
        return;
      }
    }
  }

  private async handleAdminNewMessage(context: MessageContext): Promise<void> {
    const [prefix, command] = context.text?.split(" ") || [];

    if (prefix !== this.bot.owner.prefix?.admin || this.bot.owner.rank < 3)
      return;

    for (const { pattern, handler } of this.commands) {
      if (typeof pattern === "string" && command === pattern) {
        await handler(context, this.bot);
        return;
      } else if (pattern instanceof RegExp && pattern.test(command || "")) {
        await handler(context, this.bot);
        return;
      }
    }
  }
}
