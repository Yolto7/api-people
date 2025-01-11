import { Filters } from './filters';
import { Order } from './order';

export class Criteria {
  readonly filters: Filters;
  readonly order: Order;
  readonly page?: string;
  readonly take?: string;
  readonly isTotal: boolean;

  constructor(input: {
    filters: Filters;
    order: Order;
    page?: string;
    take?: string;
    isTotal: boolean;
  }) {
    this.filters = input.filters;
    this.order = input.order;
    this.page = input.page;
    this.take = input.take;
    this.isTotal = input.isTotal;
  }

  public hasFilters(): boolean {
    return this.filters.filters.length > 0;
  }
}
