import { AppError, ErrorTypes } from '../error';
import { FilterField } from './filterField';
import { FilterOperator } from './filterOperator';
import { FilterValue, FilterValueTypes } from './filterValue';

export class Filter {
  readonly field: FilterField;
  readonly operator: FilterOperator;
  readonly value: FilterValue;

  constructor(field: FilterField, operator: FilterOperator, value: FilterValue) {
    this.field = field;
    this.operator = operator;
    this.value = value;
  }

  static fromValues(values: Map<string, FilterValueTypes>): Filter {
    const field = values.get('field');
    const operator = values.get('operator');
    const value = values.get('value');

    if (!field || !operator || value === null || value === undefined) {
      throw new AppError(ErrorTypes.BAD_REQUEST, 'The filter is invalid', 'ERR_INVALID_FILTER');
    }

    return new Filter(
      new FilterField(field as string),
      FilterOperator.fromValue(operator as string),
      new FilterValue(value)
    );
  }
}
