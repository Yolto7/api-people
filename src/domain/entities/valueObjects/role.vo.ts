import { AppError, ErrorTypes, EnumValueObject, cuidaRole } from '@common';

export class UserRole extends EnumValueObject<cuidaRole> {
  private constructor(value: cuidaRole) {
    super(value, Object.values(cuidaRole));
  }

  static create(value: cuidaRole): UserRole {
    return new UserRole(value);
  }

  update(newValue: cuidaRole): UserRole {
    if (this.value === newValue) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'User role cannot be the same as the current one',
        'ERR_USER_ROLE_SAME'
      );
    }

    const updated = UserRole.create(newValue);
    updated.isModified = true;

    return updated;
  }

  protected throwErrorForInvalidValue(value: cuidaRole): void {
    throw new AppError(
      ErrorTypes.BAD_REQUEST,
      `The user role ${value} is invalid`,
      'ERR_INVALID_ROLE'
    );
  }
}
