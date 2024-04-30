import { Prisma } from "@prisma/client";

export interface UserModel {
  id: number;
  rank: number;
  username: string;
  squad: string;
  token: string;
  cover_image: string;
  commandPrefix: string;
  scriptPrefix: string;
  adminPrefix: string;
  list: Prisma.JsonValue;
}

export interface UserFields extends Omit<UserModel, "token"> {}
