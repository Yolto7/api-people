export interface ConfigBucket {
  key: string;
  prefix: string;
}

export interface BucketPort {
  getBuffer(key: string): Promise<Buffer>;
  saveBuffer(buffer: Buffer, config: ConfigBucket): Promise<void>;
}
