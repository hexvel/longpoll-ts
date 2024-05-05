import { PrismaClient } from "@prisma/client";
import { MessageContext } from "vk-io";
import { ICommand } from "./commands/command.module";
import { IGroupContext } from "./context/context.interface";
import { CommandRegistration } from "./entities/command.model";

export class Group {
  private readonly group: IGroupContext;
  public readonly commands: CommandRegistration[] = [];

  constructor(groupContext: IGroupContext, prismaClient: PrismaClient) {
    this.group = groupContext;
    this.group.prisma = prismaClient;
    this.group.updates = groupContext.updates;

    this.setupEventHandlers();
  }

  /**
   * Starts the bot by initializing the updates and connecting to the Prisma client.
   *
   * @return {Promise<void>} A promise that resolves once the bot is successfully started.
   */
  public async start(): Promise<void> {
    try {
      this.group.updates.start();
      await this.group.prisma.$connect();
    } catch (error) {
      console.error("Error starting bot:", error);
      process.exit(1);
    }
  }

  public registerCommand(command: ICommand): void {
    this.commands.push({
      pattern: command.pattern,
      name: command.name,
      description: command.description,
      handler: command.handler,
    });
  }

  public async handleIncomingMessage(context: MessageContext): Promise<void> {
    try {
      await this.handleUserNewMessage(context);
    } catch (error) {
      console.error("Error handling new message:", error);
    }
  }

  private setupEventHandlers(): void {
    this.group.updates.on(
      "message_new",
      async (context: MessageContext, next: () => void) => {
        await this.handleIncomingMessage(context);
        next();
      }
    );
  }

  private async handleUserNewMessage(context: MessageContext): Promise<void> {
    const trim = context.text?.trimStart();
    if (!trim || trim[0] !== "!") return;

    const command = trim.slice(1);

    for (const { pattern, handler } of this.commands) {
      if (typeof pattern === "string" && command === pattern) {
        await handler(context, this.group);
        return;
      } else if (pattern instanceof RegExp && pattern.test(command || "")) {
        await handler(context, this.group);
        return;
      }
    }
  }
}
