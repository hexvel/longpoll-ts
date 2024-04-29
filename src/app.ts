import { VK } from "vk-io";

import { Command } from "./commands/command.class";
import { TestCommand } from "./commands/test.command";

import { ConfigService } from "./config/config.service";
import { IBotContext } from "./context/context.interface";

class Module {
  bot: IBotContext;
  commands: Command[] = [];

  constructor(private readonly configService: ConfigService) {
    this.bot = new VK({
      token: this.configService.get("TOKEN"),
    }) as IBotContext;
  }

  async init() {
    this.commands = [new TestCommand(this.bot)];
    for (const command of this.commands) {
      command.handle();
    }
    await this.bot.prisma.$connect();
    await this.bot.updates.start();
  }
}

const bot = new Module(new ConfigService());

(async () => {
  bot.init();
})();
