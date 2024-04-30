import { PrismaClient } from "@prisma/client";
import chalk from "chalk";
import { MessageContext, VK } from "vk-io";
import { BlackListCommand } from "./commands/blackList.command";
import { Command } from "./commands/command.module";
import { FriendCommand } from "./commands/friends.command";
import { PingCommand } from "./commands/ping.command";
import { IBotContext } from "./context/context.interface";
import { UserFields, UserModel } from "./entities/user.model";

export class Bot {
  private readonly owner: UserFields;
  private readonly bot: IBotContext;
  public readonly commands: Map<string, Command> = new Map();

  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly user: UserModel
  ) {
    this.owner = this.user;

    this.bot = new VK({ token: this.user.token }) as IBotContext;
    this.bot.prisma = prismaClient;

    this.setupCommands();
  }

  private setupCommands() {
    const friendCommand = new FriendCommand(this.bot);
    const blackListCommand = new BlackListCommand(this.bot);

    this.commands.set("пинг", new PingCommand(this.bot));
    this.commands.set("+др", friendCommand);
    this.commands.set("-др", friendCommand);
    this.commands.set("+чс", blackListCommand);
    this.commands.set("-чс", blackListCommand);
  }

  public async start() {
    try {
      this.bot.updates.on("message_new", this.handleNewMessage.bind(this));
      await this.prismaClient.$connect();
      await this.bot.updates.start();
    } catch (error) {
      console.error("Error starting bot:", error);
      process.exit(1);
    }
  }

  private async handleNewMessage(context: MessageContext, next: () => void) {
    try {
      if (context.senderId !== this.owner.id) return;

      const messageText = context.text?.toLowerCase().trim();
      const [prefix, command] = messageText?.split(" ") || [];
      if (prefix !== this.owner.commandPrefix) return;

      const cmd = this.commands.get(command);
      if (cmd) cmd.handle(context);
    } catch (error) {
      console.error("Error handling new message:", error);
    } finally {
      next();
    }
  }
}

async function run() {
  try {
    const prismaClient = new PrismaClient();
    const usersData = await prismaClient.user.findMany();

    usersData.forEach(async user => {
      console.log(
        chalk.yellow(
          `Запуск юзера ${chalk.blue.underline.bold(user.id)} ожидайте...`
        )
      );

      const bot = new Bot(prismaClient, user);
      await bot.start();

      console.log(
        chalk.green(`Юзер ${chalk.cyan.underline.bold(user.id)} запущен`)
      );
      console.log(chalk.magenta("Зарегистрированные функции:"));

      bot.commands.forEach((command, name) => {
        console.log(chalk.gray(`\t-> ${name}`));
      });
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
