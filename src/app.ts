import { PrismaClient } from "@prisma/client";
import chalk from "chalk";
import { VK } from "vk-io";
import { Bot } from "./bot";

import ignoreCommand from "./commands/arrays/ignore.command";
import ignoresCommand from "./commands/arrays/ignores.command";
import trustCommand from "./commands/arrays/trust.command";
import trustsCommand from "./commands/arrays/trusts.command";
import addToChatCommand from "./commands/user/addToChat.command";
import blackListCommand from "./commands/user/blackList.command";
import friendsCommand from "./commands/user/friends.command";
import pingCommand from "./commands/user/ping.command";
import prefixCommand from "./commands/user/prefix.command";
import removeFromChatCommand from "./commands/user/removeFromChat.command";
import userinfoCommand from "./commands/user/userinfo.command";
import usernameCommand from "./commands/user/username.command";

import triggerCommand from "./commands/arrays/trigger.command";
import { IBotContext } from "./context/context.interface";
import { UserModel } from "./entities/user.model";

export class BotApp {
  private readonly prismaClient: PrismaClient;
  private readonly users: UserModel[];

  /**
   * Initializes a new instance of the class.
   *
   * @param {PrismaClient} prismaClient - The Prisma client.
   * @param {UserModel[]} users - An array of UserModel objects.
   */
  constructor(prismaClient: PrismaClient, users: UserModel[]) {
    this.prismaClient = prismaClient;
    this.users = users;
  }

  /**
   * Runs the bot for each user in the users array,
   * creating a new bot for each user and starting it.
   *
   * @return {Promise<void>} A promise that resolves once all bots have been started.
   */
  public async run(): Promise<void> {
    for (const user of this.users) {
      console.log(
        chalk.green(
          `Starting bot for user: ` + chalk.underline.bold.cyan(user.id)
        )
      );

      const bot = this.createBot(user);
      await bot.start();

      console.log(
        chalk.blue(
          `Bot for user ` +
            chalk.underline.yellow(user.id) +
            ` started successfully`
        )
      );
    }
  }

  /**
   * Creates a new Bot instance for the given UserModel.
   *
   * @param {UserModel} user - The UserModel for which the Bot instance is created.
   * @return {Bot} The newly created Bot instance.
   */
  private createBot(user: UserModel): Bot {
    const botContext = new VK({ token: user.token }) as IBotContext;
    const bot = new Bot(botContext, user, this.prismaClient);

    this.setupCommands(bot);

    return bot;
  }

  /**
   * Sets up commands for the provided bot.
   *
   * @param {Bot} bot - The bot instance to set up commands for.
   * @return {void} This function does not return anything.
   */
  private setupCommands(bot: Bot): void {
    // Fun commands
    bot.registerCommand(pingCommand.pattern, pingCommand.handler);
    bot.registerCommand(friendsCommand.pattern, friendsCommand.handler);
    bot.registerCommand(blackListCommand.pattern, blackListCommand.handler);
    bot.registerCommand(prefixCommand.pattern, prefixCommand.handler);
    bot.registerCommand(userinfoCommand.pattern, userinfoCommand.handler);
    bot.registerCommand(usernameCommand.pattern, usernameCommand.handler);

    // Array commands
    bot.registerCommand(trustCommand.pattern, trustCommand.handler);
    bot.registerCommand(trustsCommand.pattern, trustsCommand.handler);
    bot.registerCommand(ignoreCommand.pattern, ignoreCommand.handler);
    bot.registerCommand(ignoresCommand.pattern, ignoresCommand.handler);

    // For chats
    bot.registerCommand(addToChatCommand.pattern, addToChatCommand.handler);
    bot.registerCommand(
      removeFromChatCommand.pattern,
      removeFromChatCommand.handler
    );
    bot.registerCommand(triggerCommand.pattern, triggerCommand.handler);
  }
}

(async () => {
  try {
    const prismaClient = new PrismaClient();
    const users = await prismaClient.user.findMany({
      include: { prefix: true },
    });

    const botApp = new BotApp(prismaClient, users);
    await botApp.run();
  } catch (error) {
    console.error("Failed to start bot:", error);
    process.exit(1);
  }
})();
