import { QueryCommandInput, ScanCommandInput } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

import { CriteriaConverter } from '../../../domain/criteria/converter';
import { Filter } from '../../../domain/criteria/filter';
import { Operator } from '../../../domain/criteria/filterOperator';
import { AppError, ErrorTypes } from '../../../domain/error';
import { dynamoPaginationResolver } from './pagination';
import { OrderTypes } from '../../../domain/criteria/orderType';
import { Criteria } from '../../../domain/criteria';
import { FilterValueTypes } from '../../../domain/criteria/filterValue';

interface DynamoFilter {
  expression: string;
  value: FilterValueTypes | Record<string, any>;
}

export const filterDeleted = new Map<string, FilterValueTypes>([
  ['field', 'deleted'],
  ['operator', Operator.EQUAL],
  ['value', false],
]);

export enum DynamoCommandTypes {
  QUERY = 'Query',
  SCAN = 'Scan',
}

interface DynamoSecondaryIndexes {
  name: string;
  partitionKey: string;
  sortKey?: string;
}

export interface DynamoDbCriteriaConverterInput {
  tableName: string;
  criteria: Criteria;
  partitionKey: string;
  sortKey?: string;
  secondaryIndexes?: DynamoSecondaryIndexes[];
}

export interface DynamoDbCriteriaConverterResult {
  commandType: DynamoCommandTypes;
  params: QueryCommandInput | ScanCommandInput;
}

interface TransformerFunction<T, K> {
  (value: T): K;
}

export class DynamoDbCriteriaConverter
  implements CriteriaConverter<DynamoDbCriteriaConverterInput, DynamoDbCriteriaConverterResult>
{
  private filterTransformers: Map<Operator, TransformerFunction<Filter, DynamoFilter>>;

  constructor() {
    this.filterTransformers = new Map<Operator, TransformerFunction<Filter, DynamoFilter>>([
      [Operator.EQUAL, this.equalFilter],
      [Operator.NOT_EQUAL, this.notEqualFilter],
      [Operator.GT, this.greaterThanFilter],
      [Operator.GTE, this.greaterThanEqualFilter],
      [Operator.LT, this.lowerThanFilter],
      [Operator.LTE, this.lowerThanEqualFilter],
      [Operator.IN, this.inFilter],
      [Operator.LIKE, this.likeFilter],
    ]);
  }

  convert({
    tableName,
    criteria,
    partitionKey,
    sortKey,
    secondaryIndexes = [],
  }: DynamoDbCriteriaConverterInput): DynamoDbCriteriaConverterResult {
    const attributeNames: Record<string, string> = {},
      attributeValues: Record<string, any> = {},
      keyConditionExpression: string[] = [],
      filterExpressions: string[] = [];

    const indexFound = this.findSecondaryIndex(secondaryIndexes, criteria.filters.filters);
    if (indexFound && indexFound.name && !indexFound.partitionKey) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'Secondary index is provided but partitionKey is not provided',
        'ERR_SECONDARY_INDEX_WITHOUT_PARTITION_KEY'
      );
    }

    criteria.filters.filters.forEach((filter) => {
      const transformer = this.filterTransformers.get(filter.operator.value);
      if (!transformer) {
        throw new AppError(
          ErrorTypes.BAD_REQUEST,
          `Unexpected operator value ${filter.operator.value}`,
          'ERR_UNEXPECTED_OPERATOR'
        );
      }

      const { expression, value } = transformer(filter);
      const isKeyField = this.isKeyField(filter.field.value, partitionKey, sortKey);

      (isKeyField || indexFound?.partitionKey === filter.field.value) &&
      filter.operator.value !== Operator.LIKE
        ? keyConditionExpression.push(expression)
        : filterExpressions.push(expression);

      attributeNames[`#${filter.field.value}`] = filter.field.value;

      filter.operator.value === Operator.IN
        ? Object.assign(attributeNames, value)
        : (attributeValues[`:${filter.field.value}`] = value);
    });

    if (keyConditionExpression.length) {
      return {
        commandType: DynamoCommandTypes.QUERY,
        params: {
          TableName: tableName,
          ...(indexFound && {
            IndexName: indexFound.name,
          }),
          KeyConditionExpression: keyConditionExpression.join(' AND '),
          ...(filterExpressions.length && {
            FilterExpression: filterExpressions.join(' AND '),
          }),
          ExpressionAttributeNames: attributeNames,
          ExpressionAttributeValues: marshall(attributeValues),
          ...dynamoPaginationResolver({
            page: criteria.page,
            take: criteria.take,
          }),
          ...(criteria.order.hasOrder() && {
            ScanIndexForward: criteria.order.orderType.value === OrderTypes.ASC,
          }),
        },
      } as DynamoDbCriteriaConverterResult;
    }

    return {
      commandType: DynamoCommandTypes.SCAN,
      params: {
        TableName: tableName,
        ...(filterExpressions.length && {
          FilterExpression: filterExpressions.join(' AND '),
        }),
        ExpressionAttributeNames: attributeNames,
        ExpressionAttributeValues: marshall(attributeValues),
        ...dynamoPaginationResolver({
          page: criteria.page,
          take: criteria.take,
        }),
        ...(criteria.order.hasOrder() && {
          ScanIndexForward: criteria.order.orderType.value === OrderTypes.ASC,
        }),
      },
    } as DynamoDbCriteriaConverterResult;
  }

  private findSecondaryIndex(
    indexes: DynamoSecondaryIndexes[],
    filters: Filter[]
  ): DynamoSecondaryIndexes | undefined {
    // Convert filters fields into a Set for fast lookup
    const filterFieldsSet = new Set(filters.map((filter) => filter.field.value));
    return indexes.find((index) => filterFieldsSet.has(index.partitionKey));
  }

  private isKeyField(fieldName: string, partitionKey: string, sortKey?: string): boolean {
    if (!partitionKey) return false;

    const keyFields = [`${partitionKey}`, `${sortKey}`];
    return keyFields.includes(fieldName);
  }

  private equalFilter(filter: Filter): DynamoFilter {
    return {
      expression: `#${filter.field.value} ${filter.operator.value} :${filter.field.value}`,
      value: filter.value.value,
    };
  }

  private notEqualFilter(filter: Filter): DynamoFilter {
    return {
      expression: `#${filter.field.value} ${filter.operator.value} :${filter.field.value}`,
      value: filter.value.value,
    };
  }

  private greaterThanFilter(filter: Filter): DynamoFilter {
    return {
      expression: `#${filter.field.value} ${filter.operator.value} :${filter.field.value}`,
      value: filter.value.value,
    };
  }

  private greaterThanEqualFilter(filter: Filter): DynamoFilter {
    return {
      expression: `#${filter.field.value} ${filter.operator.value} :${filter.field.value}`,
      value: filter.value.value,
    };
  }

  private lowerThanFilter(filter: Filter): DynamoFilter {
    return {
      expression: `#${filter.field.value} ${filter.operator.value} :${filter.field.value}`,
      value: filter.value.value,
    };
  }

  private lowerThanEqualFilter(filter: Filter): DynamoFilter {
    return {
      expression: `#${filter.field.value} ${filter.operator.value} :${filter.field.value}`,
      value: filter.value.value,
    };
  }

  private inFilter(filter: Filter): DynamoFilter {
    return {
      expression: `#${filter.field.value} IN (${(filter.value.value as string)
        .split(',')
        .map((v, i) => `:${v}${i}`)
        .join(', ')})`,
      value: Object.fromEntries(
        (filter.value.value as string).split(',').map((pair) => {
          const [key, value] = pair.split(':').map((str) => str.trim());
          return [`:${key}`, value];
        })
      ),
    };
  }

  private likeFilter(filter: Filter): DynamoFilter {
    return {
      expression: `contains(#${filter.field.value}, :${filter.field.value})`,
      value: filter.value.value,
    };
  }
}
