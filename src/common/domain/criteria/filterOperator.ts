import { AppError, ErrorTypes } from '../error';
import { EnumValueObject } from '../valueObject/enumValueObject';

export enum Operator {
  EQUAL = '=',
  NOT_EQUAL = '<>',
  GT = '>',
  GTE = '>=',
  LT = '<',
  LTE = '<=',
  IN = 'IN',
  NOT_IN = 'NOT IN',
  LIKE = 'LIKE',
}

export class FilterOperator extends EnumValueObject<Operator> {
  constructor(value: Operator) {
    super(value, Object.values(Operator));
  }

  static fromValue(value: string): FilterOperator {
    for (const operatorValue of Object.values(Operator)) {
      if (value === operatorValue.toString()) {
        return new FilterOperator(operatorValue);
      }
    }

    throw new AppError(
      ErrorTypes.BAD_REQUEST,
      `The filter operator ${value} is invalid`,
      'ERR_INVALID_FILTER_OPERATOR'
    );
  }

  protected throwErrorForInvalidValue(value: Operator): void {
    throw new AppError(
      ErrorTypes.BAD_REQUEST,
      `The filter operator ${value} is invalid`,
      'ERR_INVALID_FILTER_OPERATOR'
    );
  }

  static equal() {
    return this.fromValue(Operator.EQUAL);
  }
}
