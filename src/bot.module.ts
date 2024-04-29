import { PrismaClient } from "@prisma/client";
import { Context, VK } from "vk-io";
import { ConfigService } from "./config/config.service";
import { IBotContext } from "./context/context.interface";

export class BotModule {
  bot: IBotContext;
  prisma: PrismaClient;

  constructor(private readonly configService: ConfigService) {
    this.bot = new VK({
      token: this.configService.get("TOKEN"),
    }) as IBotContext;
    this.prisma = new PrismaClient();
  }

  async start() {
    await this.setupHandlers();
    await this.prisma.$connect();
    await this.bot.updates.start();
  }

  private async setupHandlers() {
    this.bot.updates.on("message_new", this.handleNewMessage.bind(this));
    // Другие обработчики событий можно добавить здесь
  }

  private async handleNewMessage(context: Context, next: () => void) {
    console.log("New message:", context.text);
    await next();
  }
}
