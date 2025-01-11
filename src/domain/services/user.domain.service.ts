import {
  AppError,
  Criteria,
  ErrorTypes,
  filterDeleted,
  Filters,
  Operator,
  Order,
  Query,
  QueryInput,
  UniqueId,
} from '@common';

import { UserRepository } from '../repositories/user.repository';
import { User } from '@domain/entities/user.entity';

export class UserDomainService {
  constructor(private readonly userRepository: UserRepository) {}

  async getById(id: UniqueId): Promise<User> {
    const user = await this.userRepository.getById(id);
    if (!user) {
      throw new AppError(ErrorTypes.NOT_FOUND, 'User not found', 'ERR_USER_NOT_FOUND');
    }

    return user;
  }

  async getByEmail(email: string): Promise<User> {
    const { users } = await this.matching({
      filters: [
        new Map([
          ['field', 'email'],
          ['operator', Operator.EQUAL],
          ['value', email],
        ]),
      ],
    });
    if (!users.length) {
      throw new AppError(ErrorTypes.NOT_FOUND, 'User not found', 'ERR_USER_NOT_FOUND');
    }

    return users[0];
  }

  async validateExist(email: string): Promise<void> {
    const { users } = await this.matching({
      filters: [
        new Map([
          ['field', 'email'],
          ['operator', Operator.EQUAL],
          ['value', email],
        ]),
      ],
    });
    if (users.length) {
      throw new AppError(
        ErrorTypes.BAD_REQUEST,
        'User already registered',
        'ERR_USER_ALREADY_REGISTERED'
      );
    }
  }

  matching(input: QueryInput) {
    !input.includeDeleted && input.filters.push(filterDeleted);

    const query = new Query({
        filters: input.filters,
        orderBy: input.orderBy,
        orderType: input.orderType,
        page: input.page,
        take: input.take,
        isTotal: input.isTotal,
        includeDeleted: input.includeDeleted,
      }),
      criteria = new Criteria({
        filters: Filters.fromValues(query.filters),
        order: Order.fromValues(query.orderBy, query.orderType),
        page: query.page,
        take: query.take,
        isTotal: query.isTotal,
      });

    return this.userRepository.matching(criteria);
  }

  async update(user: User): Promise<void> {
    if (!user.hasUpdates()) {
      return;
    }

    return this.userRepository.update(user);
  }
}
