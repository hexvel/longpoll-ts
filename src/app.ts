import { PrismaClient } from "@prisma/client";
import { Context, VK } from "vk-io";

import { Command } from "./commands/command.module";
import { TestCommand } from "./commands/test.command";

import { ConfigService } from "./config/config.service";
import { IBotContext } from "./context/context.interface";

export class Bot {
  bot: IBotContext;
  commands: Command[] = [];

  constructor(private readonly configService: ConfigService) {
    this.bot = new VK({
      token: this.configService.get("TOKEN"),
    }) as IBotContext;
    this.bot.prisma = new PrismaClient();
    this.setupCommands();
  }

  setupCommands() {
    this.commands.push(new TestCommand(this.bot));
  }

  async start() {
    await this.setupHandlers();
    await this.bot.prisma.$connect();
    await this.bot.updates.start();
  }

  private async setupHandlers() {
    this.bot.updates.on("message_new", this.handleNewMessage.bind(this));
  }

  private async handleNewMessage(context: Context, next: () => void) {
    const messageText = context.text.toLowerCase().trim();

    switch (messageText) {
      case "test":
        const command = this.commands.find(cmd => cmd instanceof TestCommand);
        if (command) command.handle(context);
        break;
    }
    next();
  }
}

const bot = new Bot(new ConfigService());
bot.start();
