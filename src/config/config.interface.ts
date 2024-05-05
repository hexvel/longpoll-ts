import { IBotContext, IGroupContext } from "../context/context.interface";

export interface IConfigService {
  set(key: string | number, value: IBotContext | string): void;
  get(key: string | number): string | IBotContext | IGroupContext;
}
