import { AppError, ErrorTypes, EnumValueObject } from '@common';

export enum UserStatusTypes {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export const UserStatusTree: {
  [key: keyof { [key: string]: UserStatusTypes }]: UserStatusTypes[];
} = {
  [UserStatusTypes.ACTIVE]: [UserStatusTypes.INACTIVE],
  [UserStatusTypes.INACTIVE]: [UserStatusTypes.ACTIVE],
};

export class UserStatus extends EnumValueObject<UserStatusTypes> {
  private constructor(value: UserStatusTypes) {
    super(value, Object.values(UserStatusTypes));
  }

  static create(value: UserStatusTypes): UserStatus {
    return new UserStatus(value);
  }

  update(newStatus: UserStatusTypes): UserStatus {
    if (this.value === newStatus) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'User status cannot be the same as the current one',
        'ERR_USER_STATUS_SAME'
      );
    }
    if (!UserStatusTree[this.value].includes(newStatus)) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'User status not allowed',
        'ERR_User_STATUS_NOT_ALLOWED'
      );
    }

    const updated = UserStatus.create(newStatus);
    updated.isModified = true;

    return updated;
  }

  protected throwErrorForInvalidValue(value: UserStatusTypes): void {
    throw new AppError(
      ErrorTypes.BAD_REQUEST,
      `The user status type ${value} is invalid`,
      'ERR_INVALID_USER_STATUS'
    );
  }
}
