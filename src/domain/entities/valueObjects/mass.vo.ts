import { AppError, ErrorTypes, NumberValueObject } from '@common';

export class PeopleMass extends NumberValueObject {
  private constructor(value: number) {
    super(value);
  }

  static create(value: number): PeopleMass {
    if (value <= 0) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'The people mass must be greater than 0',
        'ERR_INVALID_PEOPLE_MASS'
      );
    }

    return new PeopleMass(value);
  }

  update(value: number): PeopleMass {
    if (this.value === value) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'The people mass cannot be the same as the current one',
        'ERR_INVALID_PEOPLE_MASS'
      );
    }

    const updated = PeopleMass.create(value);
    updated.isModified = true;

    return updated;
  }
}
