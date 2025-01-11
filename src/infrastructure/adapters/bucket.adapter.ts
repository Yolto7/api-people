import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

import { AppError, ErrorTypes, Logger, streamToBuffer } from '@common';

import { Config } from '@config';
import { BucketPort, ConfigBucket } from '@domain/ports/bucket.port';

export class BucketAdapter implements BucketPort {
  private readonly s3;

  constructor(
    private readonly config: Config,
    private readonly logger: Logger
  ) {
    this.s3 = new S3Client();
  }

  async getBuffer(key: string): Promise<Buffer> {
    try {
      const params = {
        Bucket: this.config.AWS_APP_SHARED_BUCKET_NAME,
        Key: key,
      };

      const data = await this.s3.send(new GetObjectCommand(params));
      return await streamToBuffer(data.Body);
    } catch (error) {
      this.logger.error(`Error in BucketAdapter of getBody: ${JSON.stringify(error)}`);
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        `Error getting body from bucket`,
        'ERR_GET_BODY_FROM_BUCKET'
      );
    }
  }

  async saveBuffer(buffer: Buffer, config: ConfigBucket): Promise<void> {
    try {
      const params = {
        Bucket: this.config.AWS_APP_SHARED_BUCKET_NAME,
        Key: config.key,
        Body: buffer,
      };

      await this.s3.send(new PutObjectCommand(params));
    } catch (error) {
      this.logger.error(`Error in BucketAdapter of saveBuffer: ${JSON.stringify(error)}`);
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        `Error saving buffer in bucket`,
        'ERR_SAVE_BUFFER_IN_BUCKET'
      );
    }
  }
}
