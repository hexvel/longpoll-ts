import { PrismaClient } from "@prisma/client";
import chalk from "chalk";
import { VK } from "vk-io";
import { Bot } from "./bot";

// Import commands
import registrationCommand from "./commands/admin/registration.command";
import removeCommand from "./commands/admin/remove.command";
import ignoreCommand from "./commands/arrays/ignore.command";
import ignoresCommand from "./commands/arrays/ignores.command";
import templateCommand from "./commands/arrays/template.command";
import templatesCommand from "./commands/arrays/templates.command";
import triggerCommand from "./commands/arrays/trigger.command";
import triggersCommand from "./commands/arrays/triggers.command";
import trustCommand from "./commands/arrays/trust.command";
import trustsCommand from "./commands/arrays/trusts.command";
import disableGroupCommand from "./commands/group/user/disable.groupCommand";
import enableGroupCommand from "./commands/group/user/enable.groupCommand";
import pingGroupCommand from "./commands/group/user/ping.groupCommand";
import addToChatCommand from "./commands/user/addToChat.command";
import blackListCommand from "./commands/user/blackList.command";
import friendsCommand from "./commands/user/friends.command";
import pingCommand from "./commands/user/ping.command";
import prefixCommand from "./commands/user/prefix.command";
import removeFromChatCommand from "./commands/user/removeFromChat.command";
import sendTemplateCommand from "./commands/user/sendTemplate.command";
import userinfoCommand from "./commands/user/userinfo.command";
import usernameCommand from "./commands/user/username.command";
import weatherCommand from "./commands/user/weather.command";

import { IBotContext, IGroupContext } from "./context/context.interface";
import { GroupModel, UserModel } from "./entities/user.model";
import { Group } from "./group";

export class BotApp {
  private readonly prismaClient: PrismaClient;
  private readonly users: UserModel[];

  constructor(prismaClient: PrismaClient, users?: UserModel[]) {
    this.prismaClient = prismaClient;
    this.users = users || [];
  }

  public async run(group?: { bot: GroupModel }): Promise<void> {
    if (group) {
      const bot = this.createGroup(group.bot);
      await bot.start();
      console.error(
        chalk.green(
          `Starting bot for group: ${chalk.underline.bold.cyan(group.bot.id)}`
        )
      );
      return;
    }

    for (const user of this.users) {
      console.error(
        chalk.green(
          `Starting bot for user: ${chalk.underline.bold.cyan(user.id)}`
        )
      );
      const bot = this.createBot(user);
      await bot.start();
      console.error(
        chalk.blue(
          `Bot for user ${chalk.underline.yellow(user.id)} started successfully`
        )
      );
    }
  }

  private createBot(user: UserModel): Bot {
    const botContext = new VK({ token: user.token }) as IBotContext;
    const bot = new Bot(botContext, user, this.prismaClient);
    this.setupCommands(bot);
    return bot;
  }

  private createGroup(group: GroupModel): Group {
    const botContext = new VK({ token: group.token }) as IGroupContext;
    const bot = new Group(botContext, this.prismaClient);
    this.setupGroupCommands(bot);
    return bot;
  }

  private setupCommands(bot: Bot): void {
    // User commands
    bot.registerCommands([
      pingCommand,
      friendsCommand,
      blackListCommand,
      prefixCommand,
      userinfoCommand,
      usernameCommand,
      sendTemplateCommand,
      weatherCommand,
    ]);

    // Array commands
    bot.registerCommands([
      trustCommand,
      trustsCommand,
      ignoreCommand,
      ignoresCommand,
      triggerCommand,
      triggersCommand,
      templateCommand,
      templatesCommand,
    ]);

    // Chat commands
    bot.registerCommands([addToChatCommand, removeFromChatCommand]);

    // Admin commands
    bot.registerCommands([registrationCommand, removeCommand]);
  }

  private setupGroupCommands(group: Group) {
    group.registerCommands([
      pingGroupCommand,
      enableGroupCommand,
      disableGroupCommand,
    ]);
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

    const groupApp = new BotApp(prismaClient);
    const token =
      "vk1.a.gdjWufBoIpgxTsDqLNnmewIbEbJq5EMPwYDagSMUVg9QczZgxlxU5HMDqq_N1Yq_IN_9JnVQUc6m-hVe7CZ1Vd5_mYfs_SOdjZRD_UUR3Go5X2h7DPXImVSrMcdfj-p1fhNIfb95NXM1J2maG8evVxKT6haH6AHanqq13hZDAID6oHckg3rP7bazmDW-uTxc1REmw7eRyqJt5dsqWWFhkQ";
    await groupApp.run({ bot: { id: 224391972, token } });
  } catch (error) {
    console.error("Failed to start bot:", error);
    process.exit(1);
  }
})();
