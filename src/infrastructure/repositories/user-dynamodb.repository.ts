import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import {
  AppError,
  CommandTypes,
  Criteria,
  DynamoDbCriteriaConverter,
  dynamoNextTokenResolver,
  ErrorTypes,
  Logger,
  UserAuthProvider,
} from '@common';

import { FilterResponse, UserRepository } from '@domain/repositories/user.repository';
import { User } from '@domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { Config } from '@config';

export class UserDynamoDbRepository implements UserRepository {
  private readonly tableName: string;

  constructor(
    private readonly config: Config,
    private readonly logger: Logger,
    private readonly userAuthProvider: UserAuthProvider,
    private readonly dynamoDbCriteriaConverter: DynamoDbCriteriaConverter,
    private readonly dynamoDb: DynamoDBClient
  ) {
    this.tableName = this.config.USERS_TABLE_NAME;
  }

  async getById(id: string): Promise<User | null> {
    try {
      const params = {
        TableName: this.tableName,
        Key: marshall({ id }),
      };

      const { Item } = await this.dynamoDb.send(new GetItemCommand(params));
      return Item ? UserMapper.toDomain(unmarshall(Item)) : null;
    } catch (error) {
      this.logger.error(`Error in UserRepository of getById: ${JSON.stringify(error)}`);
      throw new AppError(ErrorTypes.BAD_REQUEST, 'Database unavailable', 'ERR_DATABASE');
    }
  }

  async matching(criteria: Criteria): Promise<FilterResponse> {
    try {
      const query = this.dynamoDbCriteriaConverter.convert({
        tableName: this.tableName,
        criteria,
        indexName: 'GSI-Users-Email',
        partitionKeyName: 'email',
      });

      const { Items = [], LastEvaluatedKey = undefined } = await this.dynamoDb.send(
        query.commandType === CommandTypes.QUERY
          ? new QueryCommand(query.params)
          : new ScanCommand(query.params)
      );

      return {
        users: Items.map((item) => UserMapper.toDomain(unmarshall(item))),
        page: dynamoNextTokenResolver(LastEvaluatedKey),
        take: query.params?.Limit?.toString(),
      };
    } catch (error) {
      this.logger.error(`Error in UserRepository of matching: ${JSON.stringify(error)}`);
      throw new AppError(ErrorTypes.BAD_REQUEST, 'Database unavailable', 'ERR_DATABASE');
    }
  }

  async create(input: User): Promise<void> {
    try {
      input.createNewEntryAudit(this.userAuthProvider.get()?.name);

      const params = {
        TableName: this.tableName,
        Item: marshall(UserMapper.toCreatePersistence(input)),
      };

      await this.dynamoDb.send(new PutItemCommand(params));
    } catch (error) {
      this.logger.error(`Error in UserRepository of create: ${JSON.stringify(error)}`);
      throw new AppError(ErrorTypes.BAD_REQUEST, 'Database unavailable', 'ERR_DATABASE');
    }
  }

  async update(input: User): Promise<void> {
    try {
      input.createUpdateEntryAudit(this.userAuthProvider.get()?.name);

      const fields = [],
        names: Record<string, string> = {},
        values: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(UserMapper.toUpdatePersistence(input))) {
        fields.push(`#${key} = :${key}`);
        names[`#${key}`] = key;
        values[`:${key}`] = value;
      }

      await this.dynamoDb.send(
        new UpdateItemCommand({
          TableName: this.tableName,
          Key: marshall({
            id: input.id,
          }),
          UpdateExpression: `set ${fields.join(', ')}`,
          ExpressionAttributeNames: names,
          ExpressionAttributeValues: marshall(values),
        })
      );
    } catch (error) {
      this.logger.error(`Error in UserRepository of update: ${JSON.stringify(error)}`);
      throw new AppError(ErrorTypes.BAD_REQUEST, 'Database unavailable', 'ERR_DATABASE');
    }
  }
}
