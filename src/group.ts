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

  /**
   * Registers a new command with the specified pattern, name, description, and handler.
   *
   * @param {ICommand} command - The command object containing pattern, name, description, and handler.
   * @return {void} This function does not return anything.
   */
  public registerCommand(command: ICommand): void {
    this.commands.push({
      pattern: command.pattern,
      name: command.name,
      description: command.description,
      handler: command.handler,
    });
  }

  /**
   * Handles an incoming message by calling the handleUserNewMessage function.
   *
   * @param {MessageContext} context - The context of the incoming message.
   * @return {Promise<void>} A promise that resolves when the message is handled.
   */
  public async handleIncomingMessage(context: MessageContext): Promise<void> {
    try {
      await this.handleUserNewMessage(context);
    } catch (error) {
      console.error("Error handling new message:", error);
    }
  }

  /**
   * Sets up event handlers for the group.
   *
   * This function registers a callback function for the "message_new" event of the group's updates.
   * The callback function handles incoming messages by calling the `handleIncomingMessage` method
   * and then invokes the `next` function.
   *
   * @return {void} This function does not return anything.
   */
  private setupEventHandlers(): void {
    this.group.updates.on(
      "message_new",
      async (context: MessageContext, next: () => void) => {
        await this.handleIncomingMessage(context);
        next();
      }
    );
  }

  /**
   * Handles a new user message by checking the prefix and command, and executing the corresponding handler.
   *
   * @param {MessageContext} context - The context of the message.
   * @return {Promise<void>} A promise that resolves when the message is handled.
   */
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
