import { createPool, FieldPacket, Pool, QueryOptions, QueryResult } from 'mysql2/promise';

import { Logger } from '../../../domain/logger';

interface ConfigDb {
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
}

export class MysqlClientFactory {
  private static instance: MysqlClientFactory;
  private client: Pool;

  private constructor(
    private readonly config: ConfigDb,
    private readonly logger: Logger
  ) {
    this.client = this.createPool(this.config);
  }

  static getInstance(config: ConfigDb, logger: Logger): MysqlClientFactory {
    if (!MysqlClientFactory.instance) {
      MysqlClientFactory.instance = new MysqlClientFactory(config, logger);
    }

    return MysqlClientFactory.instance;
  }

  private createPool(config: ConfigDb): Pool {
    this.logger.info(`Database pool created`);
    return createPool({
      host: config.DATABASE_HOST,
      port: config.DATABASE_PORT || 3306,
      user: config.DATABASE_USER,
      password: config.DATABASE_PASSWORD,
      database: config.DATABASE_NAME,
      connectionLimit: 10000,
      connectTimeout: 20000,
      idleTimeout: 20000,
    });
  }

  query<T extends QueryResult>(options: QueryOptions): Promise<[T, FieldPacket[]]> {
    return this.client.query<T>(options);
  }
}
