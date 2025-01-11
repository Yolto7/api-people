import { AppError, ErrorTypes } from '../error';
import { EnumValueObject } from '../valueObject/enumValueObject';

export enum OrderTypes {
  ASC = 'ASC',
  DESC = 'DESC',
  NONE = 'none',
}

export class OrderType extends EnumValueObject<OrderTypes> {
  constructor(value: OrderTypes) {
    super(value, Object.values(OrderTypes));
  }

  static fromValue(value: string): OrderType {
    for (const orderTypeValue of Object.values(OrderTypes)) {
      if (value === orderTypeValue.toString()) {
        return new OrderType(orderTypeValue);
      }
    }

    throw new AppError(
      ErrorTypes.BAD_REQUEST,
      `The order type ${value} is invalid`,
      'ERR_INVALID_ORDER_TYPE'
    );
  }

  public isNone(): boolean {
    return this.value === OrderTypes.NONE;
  }

  public isAsc(): boolean {
    return this.value === OrderTypes.ASC;
  }

  protected throwErrorForInvalidValue(value: OrderTypes): void {
    throw new AppError(
      ErrorTypes.BAD_REQUEST,
      `The order type ${value} is invalid`,
      'ERR_INVALID_ORDER_TYPE'
    );
  }
}
