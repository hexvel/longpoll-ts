export interface UserModel {
  id: number;
  token: string;
  username: string;
  commandPrefix: string;
  scriptPrefix: string;
  adminPrefix: string;
}

export interface UserFields extends Omit<UserModel, "token"> {}
