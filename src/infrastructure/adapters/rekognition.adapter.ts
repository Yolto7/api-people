import {
  Attribute,
  CompareFacesCommand,
  DetectFacesCommand,
  RekognitionClient,
} from '@aws-sdk/client-rekognition';
import { AppError, ErrorTypes, Logger } from '@common';

import {
  CompareFacesInput,
  CompareFacesResponse,
  RekognitionPort,
} from '@domain/ports/rekognition.port';

export class RekognitionAdapter implements RekognitionPort {
  private readonly client;

  constructor(private readonly logger: Logger) {
    this.client = new RekognitionClient();
  }

  async validateFaceQuality(imageBuffer: Buffer): Promise<void> {
    const response = await this.client.send(
      new DetectFacesCommand({
        Image: { Bytes: imageBuffer },
        Attributes: [Attribute.ALL],
      })
    );

    const face = response.FaceDetails?.[0];
    if (!face) {
      this.logger.error(`No face was detected in the image`);
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        `No face was detected in the image`,
        'ERR_NO_FACE_DETECTED'
      );
    }

    // Validate face quality
    if ((face.Quality?.Brightness ?? 0) < 40 || (face.Quality?.Sharpness ?? 0) < 50) {
      this.logger.error(
        `The image quality is not sufficient. Brightness: ${face.Quality?.Brightness}, Sharpness: ${face.Quality?.Sharpness}`
      );
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        `The image quality is not sufficient`,
        'ERR_FACE_IMAGE_QUALITY_NOT_SUFFICIENT'
      );
    }

    // Validate face alignment
    const pose = face.Pose ?? {};
    if (
      Math.abs(pose.Roll ?? 0) > 10 ||
      Math.abs(pose.Yaw ?? 0) > 15 ||
      Math.abs(pose.Pitch ?? 0) > 15
    ) {
      this.logger.error(
        `The face is not aligned correctly. Roll: ${pose.Roll}, Yaw: ${pose.Yaw}, Pitch: ${pose.Pitch}`
      );
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        `The face is not aligned correctly`,
        'ERR_FACE_NOT_ALIGNED_CORRECTLY'
      );
    }

    // Validate face expression
    if (
      face.EyesOpen?.Value === false ||
      face.MouthOpen?.Value === true ||
      face.Smile?.Value === true
    ) {
      this.logger.error(
        `The face is not suitable for recognition. EyesOpen: ${face.EyesOpen?.Value}, MouthOpen: ${face.MouthOpen?.Value}, Smile: ${face.Smile?.Value}`
      );
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        `The face is not suitable for recognition`,
        'ERR_FACE_NOT_SUITABLE'
      );
    }

    // Validate face accessories
    if (face.Sunglasses?.Value || face.Eyeglasses?.Value) {
      this.logger.error(
        `The face has sunglasses in the image. Sunglasses: ${face.Sunglasses?.Value}, Eyeglasses: ${face.Eyeglasses?.Value}`
      );
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        `The face has sunglasses in the image`,
        'ERR_FACE_SUNGLASSES'
      );
    }
  }

  async compareFaces(input: CompareFacesInput): Promise<CompareFacesResponse> {
    try {
      const response = await this.client.send(
        new CompareFacesCommand({
          SimilarityThreshold: 80,
          SourceImage: { Bytes: input.imageBuffer },
          TargetImage: { Bytes: input.s3ImageBuffer },
        })
      );

      this.logger.info(`compareFaces response: ${JSON.stringify(response)}`);
      return {
        isMatch: (response.FaceMatches?.length ?? 0) > 0,
      };
    } catch (error) {
      this.logger.error(`Error in RekognitionAdapter of compareFaces: ${JSON.stringify(error)}`);
      throw new AppError(ErrorTypes.BAD_REQUEST, `Error comparing faces`, 'ERR_COMPARE_FACES');
    }
  }
}
