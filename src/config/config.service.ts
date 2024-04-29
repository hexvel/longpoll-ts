import { config, DotenvParseOutput } from "dotenv";
import { IConfigService } from "./config.interface";

export class ConfigService implements IConfigService {
  private config: DotenvParseOutput;

  constructor() {
    const { error, parsed } = config();
    if (error) {
      throw new Error(error.message);
    }

    if (!parsed) {
      throw new Error(".env file is empty");
    }

    this.config = parsed;
  }

  get(key: string): string {
    const result = this.config[key];
    if (!result) {
      throw new Error(`${key} is not defined`);
    }

    return result;
  }
}
