export abstract class EnumValueObject<T> {
  private readonly _value: T;
  protected isModified: boolean;

  constructor(
    value: T,
    public readonly validValues: T[]
  ) {
    this._value = value;
    this.isModified = false;
    this.checkValueIsValid(value);
  }

  get value() {
    return this._value;
  }

  public checkValueIsValid(value: T): void {
    if (!this.validValues.includes(value)) {
      this.throwErrorForInvalidValue(value);
    }
  }

  protected abstract throwErrorForInvalidValue(value: T): void;
}
