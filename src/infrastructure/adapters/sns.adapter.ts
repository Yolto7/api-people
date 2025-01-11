import {
  SNSClient,
  GetEndpointAttributesCommand,
  SetEndpointAttributesCommand,
  CreatePlatformEndpointCommand,
} from '@aws-sdk/client-sns';

import { AppError, ErrorTypes, Logger } from '@common';

import { SnsCreateEndpointInput, SnsPort, SnsUpdateEndpointInput } from '@domain/ports/sns.port';

export class SnsAdapter implements SnsPort {
  private readonly client;

  constructor(private readonly logger: Logger) {
    this.client = new SNSClient();
  }

  private async getEndpointAttributes(topicArn: string): Promise<Record<string, string>> {
    try {
      const { Attributes = {} } = await this.client.send(
        new GetEndpointAttributesCommand({ EndpointArn: topicArn })
      );
      return Attributes;
    } catch (error) {
      this.logger.error(`Error in SnsAdapter of getEndpointAttributes: ${JSON.stringify(error)}`);
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        `Error getting endpoint attributes`,
        'ERR_GET_ENDPOINT_ATTRIBUTES'
      );
    }
  }

  async createEndpoint(input: SnsCreateEndpointInput): Promise<string> {
    try {
      const { EndpointArn } = await this.client.send(
        new CreatePlatformEndpointCommand({
          PlatformApplicationArn: input.platformApplicationArn,
          Token: input.deviceToken,
          CustomUserData: input.userId,
        })
      );
      if (!EndpointArn) {
        throw new AppError(
          ErrorTypes.BAD_REQUEST,
          `Error creating endpoint`,
          'ERR_CREATE_ENDPOINT'
        );
      }

      return EndpointArn;
    } catch (error) {
      this.logger.error(`Error in SnsAdapter of createEndpoint: ${JSON.stringify(error)}`);
      throw new AppError(ErrorTypes.BAD_REQUEST, `Error creating endpoint`, 'ERR_CREATE_ENDPOINT');
    }
  }

  async updateEndpoint(input: SnsUpdateEndpointInput): Promise<void> {
    try {
      const attributes = await this.getEndpointAttributes(input.topicArn);
      if (attributes.Token === input.newDeviceToken && attributes.Enabled === 'true') {
        return;
      }

      await this.client.send(
        new SetEndpointAttributesCommand({
          EndpointArn: input.topicArn,
          Attributes: {
            Token: input.newDeviceToken,
            Enabled: 'true',
          },
        })
      );
    } catch (error) {
      this.logger.error(`Error in SnsAdapter of updateEndpoint: ${JSON.stringify(error)}`);
      throw new AppError(ErrorTypes.BAD_REQUEST, `Error updating endpoint`, 'ERR_UPDATE_ENDPOINT');
    }
  }
}
