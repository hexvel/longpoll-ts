import { PrismaClient } from "@prisma/client";
import { Updates, VK } from "vk-io";

import { UserFields } from "../entities/user.model";

export interface IBotContext extends VK {
  prisma: PrismaClient;
  owner: UserFields;
  updates: Updates;
}

export interface IGroupContext extends VK {
  prisma: PrismaClient;
  updates: Updates;
}
