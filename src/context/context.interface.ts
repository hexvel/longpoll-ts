import { PrismaClient } from "@prisma/client";
import { VK } from "vk-io";

export interface IBotContext extends VK {
  prisma: PrismaClient;
}
