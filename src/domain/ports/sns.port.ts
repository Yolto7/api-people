export interface SnsCreateEndpointInput {
  platformApplicationArn: string;
  deviceToken: string;
  userId: string;
}

export interface SnsUpdateEndpointInput {
  topicArn: string;
  newDeviceToken: string;
}

export interface SnsPort {
  createEndpoint(input: SnsCreateEndpointInput): Promise<string>;
  updateEndpoint(input: SnsUpdateEndpointInput): Promise<void>;
}
