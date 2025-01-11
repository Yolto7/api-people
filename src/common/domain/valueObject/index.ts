import { AppError, ErrorTypes } from '../error/index';

export abstract class ValueObject<T> {
  private readonly _value: T;
  protected isModified: boolean;

  constructor(value: T) {
    this.ensureValueIsDefined(value);
    this._value = value;
    this.isModified = false;
  }

  get value() {
    return this._value;
  }

  private ensureValueIsDefined(value: T): void {
    if (value === null || value === undefined) {
      throw new AppError(ErrorTypes.BAD_REQUEST, 'Value must be defined', 'ERR_INVALID_VALUE');
    }
  }

  equals(other: ValueObject<T>): boolean {
    return other.constructor.name === this.constructor.name && other._value === this._value;
  }
}
