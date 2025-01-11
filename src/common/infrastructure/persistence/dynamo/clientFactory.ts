import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { Logger } from '../../../domain/logger';

interface ConfigDb {
  isDebug: boolean;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION_NAME: string;
}

export class DynamoClientFactory {
  private static instance: DynamoClientFactory;
  private client: DynamoDBClient;

  private constructor(
    private readonly config: ConfigDb,
    private readonly logger: Logger
  ) {
    this.client = this.createClient();
  }

  static getClient(config: ConfigDb, logger: Logger): DynamoDBClient {
    if (!DynamoClientFactory.instance) {
      DynamoClientFactory.instance = new DynamoClientFactory(config, logger);
    }

    return DynamoClientFactory.instance.client;
  }

  private createClient(): DynamoDBClient {
    this.logger.info(`Dynamo client created`);
    return new DynamoDBClient(
      this.config.isDebug
        ? {
            credentials: {
              accessKeyId: this.config.AWS_ACCESS_KEY_ID,
              secretAccessKey: this.config.AWS_SECRET_ACCESS_KEY,
            },
            region: this.config.AWS_REGION_NAME,
          }
        : {}
    );
  }
}
