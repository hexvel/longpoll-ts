import { PrismaClient } from "@prisma/client";
import { MessageContext, VK } from "vk-io";

import { BlackListCommand } from "./commands/blackList.command";
import { Command } from "./commands/command.module";
import { FriendCommand } from "./commands/friends.command";
import { PingCommand } from "./commands/ping.command";

import { IBotContext } from "./context/context.interface";
import { UserModel } from "./entities/user.model";

import chalk from "chalk";
import { PrefixCommand } from "./commands/prefix.command";
import { UserInfoCommand } from "./commands/userinfo.command";
import { emojis } from "./utils/emojies";
import { methods } from "./utils/methods";

class Bot {
  private readonly bot: IBotContext;
  public readonly commands: Map<string, Command> = new Map();

  /**
   * Constructs a new instance of the Bot class.
   *
   * @param {PrismaClient} prismaClient - The Prisma client instance.
   * @param {UserModel} user - The user model instance.
   */
  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly user: UserModel
  ) {
    this.bot = new VK({ token: this.user.token }) as IBotContext;
    this.bot.prisma = prismaClient;
    this.bot.owner = user;

    this.setupCommands();
  }

  /**
   * Sets up the commands for the bot.
   *
   * This function initializes the commands for the bot and maps them to their respective keys.
   *
   * @private
   * @returns {void} This function does not return anything.
   */
  private setupCommands(): void {
    const friendsCommand = new FriendCommand(this.bot);
    const blackListCommand = new BlackListCommand(this.bot);

    this.commands.set("пинг", new PingCommand(this.bot));
    this.commands.set("+др", friendsCommand);
    this.commands.set("-др", friendsCommand);
    this.commands.set("+чс", blackListCommand);
    this.commands.set("-чс", blackListCommand);
    this.commands.set("префикс", new PrefixCommand(this.bot));
    this.commands.set("инфо", new UserInfoCommand(this.bot));
  }

  /**
   * Starts the bot by connecting to the Prisma client, setting up the message_new event listener,
   * and starting the updates. If an error occurs during the process, it logs the error and exits the process.
   *
   * @return {Promise<void>} A promise that resolves when the bot has successfully started.
   */
  public async start(): Promise<void> {
    try {
      this.bot.updates.on("message_new", this.handleNewMessage.bind(this));
      await this.prismaClient.$connect();
      await this.bot.updates.start();
    } catch (error) {
      console.error("Error starting bot:", error);
      process.exit(1);
    }
  }

  /**
   * Handles a new message by checking the sender, processing the command, and sending a response.
   *
   * @param {MessageContext} context - The message context containing information about the message.
   * @param {() => void} next - The function to call to proceed to the next middleware.
   */
  private async handleNewMessage(context: MessageContext, next: () => void) {
    try {
      if (context.senderId !== this.bot.owner.id) return;

      const messageText = context.text?.toLowerCase().trim();

      const [prefix, command] = messageText?.split(" ") || [];

      if (prefix !== this.bot.owner.prefix?.command) return;

      const cmd = this.commands.get(command);
      if (cmd) {
        await cmd.handle(context);
      } else {
        await methods.editMessage({
          api: this.bot.api,
          context,
          message: `${
            emojis.warning
          } Неизвестная команда. Доступные команды: ${Array.from(
            this.commands.keys()
          ).join(", ")}`,
        });
      }
    } catch (error) {
      console.error("Error handling new message:", error);
    } finally {
      next();
    }
  }
}

/**
 * Runs the application by fetching user data from the Prisma client,
 * creating a new bot instance for each user, starting the bot,
 * and logging the successful start of each bot.
 *
 * @return {Promise<void>} A promise that resolves when all bots have successfully started.
 */
async function run(): Promise<void> {
  try {
    const prismaClient = new PrismaClient();

    const usersData = await prismaClient.user.findMany({
      include: { prefix: true },
    });

    usersData.forEach(async user => {
      console.log(
        chalk.yellow(
          `${emojis.snowflake} Запуск юзера ${chalk.blue.underline.bold(
            user.id
          )} ожидайте`
        )
      );

      const bot = new Bot(prismaClient, user);
      await bot.start();

      console.log(
        chalk.green(
          `${emojis.sparkle} Юзер ${chalk.cyan.underline.bold(user.id)} запущен`
        )
      );
      console.log(
        chalk.magenta(`${emojis.speechBalloon} Зарегистрированные функции:`)
      );

      for (const [name] of bot.commands.entries()) {
        console.log(chalk.yellowBright(`\t${emojis.lightning} ${name}`));
      }
    });
  } catch (error) {
    console.error("Failed to start", error);
    process.exit(1);
  }
}

run().catch(error => {
  console.error("Failed to start", error);
  process.exit(1);
});
