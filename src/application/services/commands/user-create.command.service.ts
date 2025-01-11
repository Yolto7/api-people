import { cuidaRole, EventBus } from '@common';

import { User } from '@domain/entities/user.entity';
import { UserStatusTypes } from '@domain/entities/valueObjects/status.vo';
import { UserRepository } from '@domain/repositories/user.repository';
import { UserDomainService } from '@domain/services/user.domain.service';

export interface UserCreateInput {
  names: string;
  lastNames: string;
  email: string;
  cellphone: string;
  password: string;
}

export class UserCreateCommandService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userDomainService: UserDomainService,
    private readonly eventBus: EventBus
  ) {}

  async execute(input: UserCreateInput): Promise<void> {
    await this.userDomainService.validateExist(input.email);

    const user = User.create({
      documentType: '',
      documentNumber: '',
      names: input.names,
      lastNames: input.lastNames,
      email: input.email,
      cellphone: input.cellphone,
      role: cuidaRole.USER,
      status: UserStatusTypes.ACTIVE,

      password: input.password,
    });

    await this.userRepository.create(user);
    return this.eventBus.publish(user.pullDomainEvents());
  }
}
