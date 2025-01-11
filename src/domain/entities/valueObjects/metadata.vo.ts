import { ValueObject } from '@common';

export interface UserMetadataProps {
  cellphoneNotifications?: {
    deviceToken: string;
    applicationEndpoint: string;
  };
}

export class UserMetadata extends ValueObject<UserMetadataProps> {
  private constructor(props: UserMetadataProps) {
    super(props);
  }

  static create(props: UserMetadataProps): UserMetadata {
    return new UserMetadata(props);
  }

  update(value: UserMetadataProps) {
    const updated = UserMetadata.create(value);
    updated.isModified = true;

    return updated;
  }
}
