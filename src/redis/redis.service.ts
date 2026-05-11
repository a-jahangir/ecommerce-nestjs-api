import { ConfigService, ConfigType } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import Redis from 'ioredis';
import appEnvConfig from '../config/app.env.config';

dotenv.config();

@Injectable()
export class RedisService {
  private readonly client: Redis;

  constructor(config: ConfigService<ConfigType<typeof appEnvConfig>>) {
    this.client = new Redis(config.get('redis', { infer: true }).port, config.get('redis', { infer: true }).host);
  }

  getClient(): Redis {
    return this.client;
  }

  async setWithExpiration(key: string, value: any, expiresIn = 120): Promise<string> {
    return await this.client.set(key, JSON.stringify(value), 'EX', expiresIn);
  }

  async get(key: string): Promise<any> {
    const result = await this.client.get(key);
    return result ? JSON.parse(result) : null;
  }
  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
