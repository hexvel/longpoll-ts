import { Prisma } from "@prisma/client";

export interface IPrefixModel {
  id: number;
  command: string;
  script: string;
  admin: string;
  userId: number;
}

export interface UserModel {
  id: number;
  rank: number;
  username: string;
  squad: string;
  token: string;
  prefix: IPrefixModel | null;
  cover_image: string;
  list: Prisma.JsonValue;
}

export interface IList {
  trust: number[];
  ignore: number[];
}

export interface UserFields extends Omit<UserModel, "token"> {}
