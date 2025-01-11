import { FilterValueTypes } from './filterValue';

export interface QueryPage {
  page?: string;
  take?: string;
}

export interface QueryInput extends QueryPage {
  filters: Array<Map<string, FilterValueTypes>>;
  orderBy?: string;
  orderType?: string;
  isTotal?: boolean;
  includeDeleted?: boolean;
}

export class Query {
  readonly filters: Array<Map<string, FilterValueTypes>>;
  readonly orderBy?: string;
  readonly orderType?: string;
  readonly page?: string;
  readonly take?: string;
  readonly isTotal: boolean;
  readonly includeDeleted: boolean;

  constructor(input: {
    filters: Array<Map<string, FilterValueTypes>>;
    orderBy?: string;
    orderType?: string;
    page?: string;
    take?: string;
    isTotal?: boolean;
    includeDeleted?: boolean;
  }) {
    this.filters = input.filters;
    this.orderBy = input.orderBy;
    this.orderType = input.orderType;
    this.page = input.page;
    this.take = input.take;
    this.isTotal = input.isTotal ?? false;
    this.includeDeleted = input.includeDeleted ?? false;
  }
}
