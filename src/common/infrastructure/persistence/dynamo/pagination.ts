import { QueryPage } from '../../../domain/criteria/query';

interface DynamoPagination {
  ExclusiveStartKey?: string;
  Limit?: number;
}

export function dynamoNextTokenResolver(nextToken?: unknown): string | undefined {
  return nextToken ? Buffer.from(JSON.stringify(nextToken)).toString('base64') : undefined;
}

export function dynamoPaginationResolver(input: QueryPage): DynamoPagination {
  return {
    ExclusiveStartKey: input.page
      ? JSON.parse(Buffer.from(input.page, 'base64').toString('utf-8'))
      : undefined,
    Limit: input.take ? parseInt(input.take) : 50,
  };
}
