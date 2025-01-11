import { UserAuthProvider } from '@common';

import { UserDomainService } from '@domain/services/user.domain.service';
import { BucketPort } from '@domain/ports/bucket.port';
import { RekognitionPort } from '@domain/ports/rekognition.port';

export interface UserPhotoCompareInput {
  file: {
    content: Buffer;
    encoding: string;
    filename: string;
    mimetype: string;
    truncated: boolean;
  };
}

export class UserPhotoCompareCommandService {
  constructor(
    private readonly userAuthProvider: UserAuthProvider,
    private readonly userDomainService: UserDomainService,
    private readonly bucketPort: BucketPort,
    private readonly rekognitionPort: RekognitionPort
  ) {}

  async execute(input: UserPhotoCompareInput) {
    const user = await this.userDomainService.getById(this.userAuthProvider.get()?.id);

    return this.rekognitionPort.compareFaces({
      imageBuffer: input.file.content,
      s3ImageBuffer: await this.bucketPort.getBuffer(user.photo),
    });
  }
}
