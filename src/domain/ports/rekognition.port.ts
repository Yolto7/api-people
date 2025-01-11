export interface CompareFacesInput {
  imageBuffer: Buffer;
  s3ImageBuffer: Buffer;
}

export interface CompareFacesResponse {
  isMatch: boolean;
}

export interface RekognitionPort {
  validateFaceQuality(imageBuffer: Buffer): Promise<void>;
  compareFaces(input: CompareFacesInput): Promise<CompareFacesResponse>;
}
