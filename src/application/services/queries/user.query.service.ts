import { AppError, cuidaRole, ErrorTypes, UniqueId, UserAuthProvider } from '@common';

import { UserDomainService } from '@domain/services/user.domain.service';

export class UserQueriesService {
  constructor(
    private readonly userAuthProvider: UserAuthProvider,
    private readonly userDomainService: UserDomainService
  ) {}

  getById(id: UniqueId) {
    const currentUser = this.userAuthProvider.get();
    if (currentUser.role === cuidaRole.USER && currentUser.id !== id) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'You cannot update another user',
        'ERR_USER_NOT_AUTHORIZED'
      );
    }

    return this.userDomainService.getById(id);
  }

  getByEmail(email: string) {
    const currentUser = this.userAuthProvider.get();
    if (currentUser.role === cuidaRole.USER && currentUser.email !== email) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'You cannot update another user',
        'ERR_USER_NOT_AUTHORIZED'
      );
    }

    return this.userDomainService.getByEmail(email);
  }
}
