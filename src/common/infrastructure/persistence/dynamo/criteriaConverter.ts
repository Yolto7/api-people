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

export const dynamoFilterDeleted = new Map<string, FilterValueTypes>([
  ['field', 'deleted'],
  ['operator', Operator.EQUAL],
  ['value', false],
]);

export enum CommandTypes {
  QUERY = 'Query',
  SCAN = 'Scan',
}

export interface DynamoIndexes {
  name: string;
  partitionKeyName: string;
  sortKeyName?: string;
}

export interface DynamoDbCriteriaConverterInput {
  tableName: string;
  criteria: Criteria;
  indexes: DynamoIndexes[];
}

export interface DynamoDbCriteriaConverterResult {
  commandType: CommandTypes;
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
    indexes,
  }: DynamoDbCriteriaConverterInput): DynamoDbCriteriaConverterResult {
    const attributeNames: Record<string, string> = {},
      attributeValues: Record<string, any> = {},
      keyConditionExpression: string[] = [],
      filterExpressions: string[] = [];

    const indexFound = this.findMatchingIndex(indexes, criteria.filters.filters);
    if (indexFound && indexFound.name && !indexFound.partitionKeyName) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'IndexName is provided but partitionKeyName is not provided',
        'ERR_INDEX_NAME_WITHOUT_PARTITION_KEY'
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

      indexFound?.partitionKeyName === filter.field.value && filter.operator.value !== Operator.LIKE
        ? keyConditionExpression.push(expression)
        : filterExpressions.push(expression);

      attributeNames[`#${filter.field.value}`] = filter.field.value;

      filter.operator.value === Operator.IN
        ? Object.assign(attributeNames, value)
        : (attributeValues[`:${filter.field.value}`] = value);
    });

    if (indexFound && keyConditionExpression.length) {
      return {
        commandType: CommandTypes.QUERY,
        params: {
          TableName: tableName,
          IndexName: indexFound.name,
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
      commandType: CommandTypes.SCAN,
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

  private findMatchingIndex(
    indexes: DynamoIndexes[],
    filters: Filter[]
  ): DynamoIndexes | undefined {
    // Convert filters fields into a Set for fast lookup
    const filterFieldsSet = new Set(filters.map((filter) => filter.field.value));

    // Find the first index whose partitionKeyName exists in the filter fields
    return indexes.find((index) => filterFieldsSet.has(index.partitionKeyName));
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
