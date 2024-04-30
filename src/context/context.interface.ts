import { PrismaClient } from "@prisma/client";
import { VK } from "vk-io";

import { UserFields } from "../entities/user.model";

export interface IBotContext extends VK {
  prisma: PrismaClient;
  owner: UserFields;
}
