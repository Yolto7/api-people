import { AppError, ErrorTypes, UserAuthProvider } from '@common';

import { UserDomainService } from '@domain/services/user.domain.service';
import { BucketPort } from '@domain/ports/bucket.port';
import { RekognitionPort } from '@domain/ports/rekognition.port';

export interface UserPhotoUploadInput {
  file: {
    content: Buffer;
    encoding: string;
    filename: string;
    mimetype: string;
    truncated: boolean;
  };
}

export class UserPhotoUploadCommandService {
  constructor(
    private readonly userAuthProvider: UserAuthProvider,
    private readonly userDomainService: UserDomainService,
    private readonly bucketPort: BucketPort,
    private readonly rekognitionPort: RekognitionPort
  ) {}

  async execute(input: UserPhotoUploadInput) {
    const user = await this.userDomainService.getById(this.userAuthProvider.get()?.id);
    if (user.isUploadedPhoto) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'User photo is already uploaded',
        'ERR_USER_PHOTO_ALREADY_UPLOADED'
      );
    }

    const prefix = `services/users/photos/${user.id}`,
      bucketKey = `${prefix}/${user.id}_${Date.now()}`;

    await this.rekognitionPort.validateFaceQuality(input.file.content);

    await this.bucketPort.saveBuffer(input.file.content, {
      key: bucketKey,
      prefix,
    });

    user.updatePhoto(bucketKey);

    return this.userDomainService.update(user);
  }
}
