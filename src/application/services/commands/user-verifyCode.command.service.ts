import { AppError, ErrorTypes, EventBus, UserAuthProvider } from '@common';
import { MultifactorProxyPort } from '@domain/ports/multifactorProxy.port';
import { UserDomainService } from '@domain/services/user.domain.service';

export interface UserVerifyCommandInput {
  code: string;
}

export class UserVerifyCommandService {
  constructor(
    private readonly userAuthProvider: UserAuthProvider,
    private readonly userDomainService: UserDomainService,
    private readonly multifactorProxyPort: MultifactorProxyPort,
    private readonly eventBus: EventBus
  ) {}

  async execute(input: UserVerifyCommandInput) {
    const user = await this.userDomainService.getById(this.userAuthProvider.get()?.id);
    if (user.isVerified) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'User is already verified',
        'ERR_USER_ALREADY_VERIFIED'
      );
    }

    await this.multifactorProxyPort.verify({
      userId: user.id,
      code: input.code,
    });

    user.updateIsVerified(true);

    await this.userDomainService.update(user);
    return this.eventBus.publish(user.pullDomainEvents());
  }
}
