import { AppError, ErrorTypes, UserAuthProvider } from '@common';

import { MultifactorProxyPort, MultifactorTypes } from '@domain/ports/multifactorProxy.port';
import { UserDomainService } from '@domain/services/user.domain.service';

export class UserResendCodeCommandService {
  constructor(
    private readonly userAuthProvider: UserAuthProvider,
    private readonly userDomainService: UserDomainService,
    private readonly multifactorProxyPort: MultifactorProxyPort
  ) {}

  async execute() {
    const user = await this.userDomainService.getById(this.userAuthProvider.get().id);
    if (user.isVerified) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'User is already verified',
        'ERR_USER_ALREADY_VERIFIED'
      );
    }

    return this.multifactorProxyPort.sendEmail({
      userId: user.id,
      type: MultifactorTypes.EMAIL,
      email: user.email,
      subject: 'Email verification',
      message: `Hello ${user.names.split(' ')[0]}, your verification code is {{code}}`,
    });
  }
}
