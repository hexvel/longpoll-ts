import { PrismaClient } from "@prisma/client";
import { MessageContext, VK } from "vk-io";

import { Command } from "./commands/command.module";
import { TestCommand } from "./commands/test.command";

import { ConfigService } from "./config/config.service";
import { IBotContext } from "./context/context.interface";

export class Bot {
  private ownerId: number = 0;
  private readonly bot: IBotContext;
  private readonly commands: Command[] = [];

  constructor(
    private readonly prismaClient: PrismaClient,
    private readonly vk: VK
  ) {
    this.bot = this.vk as IBotContext;
    this.setupCommands();
  }

  private setupCommands() {
    this.commands.push(new TestCommand(this.bot));
  }

  public async start() {
    try {
      await this.setupHandlers();
      await this.prismaClient.$connect();
      await this.bot.updates.start();
    } catch (error) {
      console.error("Error starting bot:", error);
    }
  }

  private async setupHandlers() {
    try {
      const accountData = await this.bot.api.account.getProfileInfo();
      this.ownerId = accountData.id;

      this.bot.updates.on("message_new", this.handleNewMessage.bind(this));
    } catch (error) {
      console.error("Error setting up handlers:", error);
    }
  }

  private async handleNewMessage(context: MessageContext, next: () => void) {
    try {
      if (context.senderId !== this.ownerId) return;

      const messageText = context.text?.toLowerCase().trim();

      switch (messageText) {
        case "test":
          const command = this.commands.find(cmd => cmd instanceof TestCommand);
          if (command) command.handle(context);
          break;
      }
    } catch (error) {
      console.error("Error handling new message:", error);
    } finally {
      return next();
    }
  }
}

const configService = new ConfigService();
const prismaClient = new PrismaClient();
const vk = new VK({
  token: configService.get("TOKEN"),
});

const bot = new Bot(prismaClient, vk);
bot.start();
