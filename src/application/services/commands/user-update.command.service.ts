import { AppError, cuidaRole, ErrorTypes, UniqueId, UserAuthProvider } from '@common';
import { Config } from '@config';
import { User } from '@domain/entities/user.entity';
import { SnsPort } from '@domain/ports/sns.port';

import { UserDomainService } from '@domain/services/user.domain.service';

export interface UserUpdateInput {
  documentType?: string;
  documentNumber?: string;
  names?: string;
  lastNames?: string;
  email?: string;
  cellphone?: string;
  cellphoneToken?: string;
}

export class UserUpdateCommandService {
  constructor(
    private readonly config: Config,
    private readonly userAuthProvider: UserAuthProvider,
    private readonly userDomainService: UserDomainService,
    private readonly snsPort: SnsPort
  ) {}

  async execute(id: UniqueId, input: UserUpdateInput) {
    const currentUser = this.userAuthProvider.get();
    if (currentUser.role === cuidaRole.USER && currentUser.id !== id) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'You cannot update another user',
        'ERR_USER_NOT_AUTHORIZED'
      );
    }

    const user = await this.userDomainService.getById(id);

    input.documentType && user.updateDocumentType(input.documentType);

    input.documentNumber && user.updateDocumentNumber(input.documentNumber);

    input.names && user.updateNames(input.names);

    input.lastNames && user.updateLastNames(input.lastNames);

    input.email && (await this.updateEmail(user, input.email));

    input.cellphone && user.updateCellphone(input.cellphone);

    input.cellphoneToken &&
      user.metadata.cellphoneNotifications?.deviceToken !== input.cellphoneToken &&
      (await this.updateMedata(user, input.cellphoneToken));

    return this.userDomainService.update(user);
  }

  private async updateEmail(user: User, email: string) {
    await this.userDomainService.validateExist(email);
    user.updateEmail(email);
  }

  private async updateMedata(user: User, cellphoneToken: string) {
    if (!user.metadata.cellphoneNotifications) {
      user.updateMetadata({
        cellphoneNotifications: {
          deviceToken: cellphoneToken,
          applicationEndpoint: await this.snsPort.createEndpoint({
            platformApplicationArn: this.config.SNS_PUSH_NOTIFICATION_APP_ARN,
            deviceToken: cellphoneToken,
            userId: user.id,
          }),
        },
      });

      return;
    }

    await this.snsPort.updateEndpoint({
      topicArn: user.metadata.cellphoneNotifications.applicationEndpoint,
      newDeviceToken: cellphoneToken,
    });

    user.updateMetadata({
      cellphoneNotifications: {
        deviceToken: cellphoneToken,
        applicationEndpoint: user.metadata.cellphoneNotifications.applicationEndpoint,
      },
    });
  }
}
