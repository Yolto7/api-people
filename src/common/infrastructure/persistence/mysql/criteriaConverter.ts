import { CriteriaConverter } from '../../../domain/criteria/converter';
import { Criteria } from '../../../domain/criteria';
import { Filter } from '../../../domain/criteria/filter';
import { Filters } from '../../../domain/criteria/filters';
import { Order } from '../../../domain/criteria/order';
import { sqlPaginationResolver } from './pagination';
import { Operator } from '../../../domain/criteria/filterOperator';
import { FilterValueTypes } from '../../../domain/criteria/filterValue';
import { AppError, ErrorTypes } from '../../../domain/error';

type MysqlFilter = { field: string; value: FilterValueTypes | string[] | number[] };
type MysqlGenerateFilter = { filters: string; values: FilterValueTypes[] };

export function mysqlFilterDeleted(column = 'deleted'): Map<string, FilterValueTypes> {
  return new Map<string, FilterValueTypes>([
    ['field', column],
    ['operator', Operator.EQUAL],
    ['value', 0],
  ]);
}

export interface MysqlConverterResult {
  filter: string;
  values: FilterValueTypes[];
  sort: string;
  pagination: string;
  page: number;
  take: number;
}

interface TransformerFunction<T, K> {
  (value: T): K;
}

export class MysqlCriteriaConverter implements CriteriaConverter<Criteria, MysqlConverterResult> {
  private filterTransformers: Map<Operator, TransformerFunction<Filter, MysqlFilter>>;
  constructor() {
    this.filterTransformers = new Map<Operator, TransformerFunction<Filter, MysqlFilter>>([
      [Operator.EQUAL, this.equalFilter],
      [Operator.NOT_EQUAL, this.notEqualFilter],
      [Operator.GT, this.greaterThanFilter],
      [Operator.GTE, this.greaterThanEqualFilter],
      [Operator.LT, this.lowerThanFilter],
      [Operator.LTE, this.lowerThanEqualFilter],
      [Operator.IN, this.inFilter],
      [Operator.NOT_IN, this.notInFilter],
      [Operator.LIKE, this.likeFilter],
    ]);
  }

  convert(criteria: Criteria): MysqlConverterResult {
    const { page, offset, limit } = sqlPaginationResolver(criteria),
      { filters, values: filterValues } = this.generateFilter(criteria.filters);

    return {
      filter: criteria.hasFilters() ? filters : '',
      values: [...filterValues, limit, ...(offset ? [offset] : [])],
      sort: criteria.order.hasOrder() ? this.generateSort(criteria.order) : '',
      pagination: this.generatePagination(offset),
      page: page,
      take: limit,
    };
  }

  protected generateFilter(filters: Filters): MysqlGenerateFilter {
    const filter = filters.filters.map((filter) => {
      const transformer = this.filterTransformers.get(filter.operator.value);
      if (!transformer) {
        throw new AppError(
          ErrorTypes.BAD_REQUEST,
          `Unexpected operator value ${filter.operator.value}`,
          'ERR_UNEXPECTED_OPERATOR'
        );
      }

      return transformer(filter);
    });

    return {
      filters: `WHERE ${filter.map((e) => e.field).join(' AND ')}`,
      values: filter.map((e) => e.value).flat(),
    };
  }

  protected generateSort(order: Order): string {
    return `ORDER BY ${order.orderBy.value} ${order.orderType.value}`;
  }

  protected generatePagination(offset?: number): string {
    return offset ? `LIMIT ? OFFSET ?` : `LIMIT ?`;
  }

  private equalFilter(filter: Filter): MysqlFilter {
    return {
      field: `${filter.field.value} ${filter.operator.value} ?`,
      value: filter.value.value,
    };
  }

  private notEqualFilter(filter: Filter): MysqlFilter {
    return {
      field: `${filter.field.value} ${filter.operator.value} ?`,
      value: filter.value.value,
    };
  }

  private greaterThanFilter(filter: Filter): MysqlFilter {
    return {
      field: `${filter.field.value} ${filter.operator.value} ?`,
      value: filter.value.value,
    };
  }

  private greaterThanEqualFilter(filter: Filter): MysqlFilter {
    return {
      field: `${filter.field.value} ${filter.operator.value} ?`,
      value: filter.value.value,
    };
  }
  private lowerThanFilter(filter: Filter): MysqlFilter {
    return {
      field: `${filter.field.value} ${filter.operator.value} ?`,
      value: filter.value.value,
    };
  }

  private lowerThanEqualFilter(filter: Filter): MysqlFilter {
    return {
      field: `${filter.field.value} ${filter.operator.value} ?`,
      value: filter.value.value,
    };
  }

  private inFilter(filter: Filter): MysqlFilter {
    const values = filter.value.value
      .toString()
      .split(',')
      .map((v) => v.trim());
    return {
      field: `${filter.field.value} ${filter.operator.value} (${Array(values.length).fill('?').join(', ')})`,
      value: values,
    };
  }

  private notInFilter(filter: Filter): MysqlFilter {
    const values = filter.value.value
      .toString()
      .split(',')
      .map((v) => v.trim());
    return {
      field: `${filter.field.value} ${filter.operator.value} (${Array(values.length).fill('?').join(', ')})`,
      value: values,
    };
  }

  private likeFilter(filter: Filter): MysqlFilter {
    return {
      field: `${filter.field.value} ${filter.operator.value} ?`,
      value: `%${filter.value.value}%`,
    };
  }
}
