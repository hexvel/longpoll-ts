import { IBotContext } from "../context/context.interface";
import { IConfigService } from "./config.interface";

export class ConfigService implements IConfigService {
  private config: Map<string | number, IBotContext | string>;

  constructor() {
    this.config = new Map<string | number, IBotContext | string>();
  }

  set(key: string | number, value: IBotContext | string): void {
    this.config.set(key, value);
  }

  get(key: string | number): string | string | IBotContext {
    const value = this.config.get(key);
    return value!;
  }
}

export const config = new ConfigService();
