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

  /**
   * Initializes a new instance of the Bot class.
   *
   * @param {IBotContext} botContext - The bot context.
   * @param {UserModel} user - The user model.
   * @param {PrismaClient} prismaClient - The Prisma client.
   */
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

  /**
   * Starts the bot by initializing the updates and connecting to the Prisma client.
   *
   * @return {Promise<void>} A promise that resolves once the bot is successfully started.
   */
  public async start(): Promise<void> {
    try {
      this.bot.updates.start();
      await this.bot.prisma.$connect();
    } catch (error) {
      console.error("Error starting bot:", error);
      process.exit(1);
    }
  }

  /**
   * Registers a new command with the specified pattern and handler.
   *
   * @param {string | RegExp} pattern - The pattern to match for the command.
   * @param {CommandHandler} handler - The handler function for the command.
   * @return {void} This function does not return anything.
   */
  public registerCommand(
    pattern: string | RegExp,
    handler: CommandHandler
  ): void {
    this.commands.push({ pattern, handler });
  }

  /**
   * Handles an incoming message by loading its payload, checking for ignored or trusted users,
   * and handling it based on the sender's ID and the bot's owner's ID.
   *
   * @param {MessageContext} context - The context of the incoming message.
   * @return {Promise<void>} A promise that resolves when the message is handled.
   */
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

  /**
   * Sets up event handlers for the bot.
   *
   * This function registers a callback function for the "message_new" event of the bot's updates.
   * The callback function handles incoming messages by calling the `handleIncomingMessage` method
   * and then invokes the `next` function.
   *
   * @return {void} This function does not return anything.
   */
  private setupEventHandlers(): void {
    this.bot.updates.on(
      "message_new",
      async (context: MessageContext, next: () => void) => {
        await this.handleIncomingMessage(context);
        next();
      }
    );
  }

  /**
   * Checks if the sender of the incoming message is in the ignore list.
   *
   * @param {MessageContext} context - The context of the incoming message.
   * @return {Promise<void>} A promise that resolves when the check is complete.
   */
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

  /**
   * Checks if the sender of the incoming message is in the trust list.
   * If the message starts with "#" and the sender is in the trust list,
   * the message is sent without the "#" character.
   *
   * @param {MessageContext} context - The context of the incoming message.
   * @return {Promise<void>} A promise that resolves when the check is complete.
   */
  private async checkTrustUsers(context: MessageContext): Promise<void> {
    const { trust } = helpers.parsePrismaJSON<IList>(
      this.bot.owner.list as unknown as IList,
      /**
       * Handles a new user message.
       *
       * @param {MessageContext} context - The context of the message.
       * @return {Promise<void>} A promise that resolves when the message is handled.
       */
      "trust"
    );
    /**
     * Handle a new message from a user.
     *
     * @param {MessageContext} context - The message context containing user information.
     * @return {Promise<void>} A promise that resolves once the message is handled.
     */

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