import {
  AppError,
  Criteria,
  ErrorTypes,
  Filters,
  mysqlFilterDeleted,
  Operator,
  Order,
  Query,
  QueryInput,
  UniqueId,
} from '@common';

import { PeopleRepository } from '@domain/repositories/people.repository';

export class PeopleDomainService {
  constructor(private readonly peopleRepository: PeopleRepository) {}

  async getById(id: UniqueId) {
    const filterId: Map<string, string> = new Map([
      ['field', 'id'],
      ['operator', Operator.EQUAL],
      ['value', id],
    ]);

    const { people } = await this.matching({ filters: [filterId] });
    if (!people.length) {
      throw new AppError(ErrorTypes.NOT_FOUND, `Person not found`, 'ERR_PERSON_NOT_FOUND');
    }

    return people[0];
  }

  matching(input: QueryInput) {
    !input.includeDeleted && input.filters.push(mysqlFilterDeleted());

    const query = new Query({
      filters: input.filters,
      orderBy: input.orderBy,
      orderType: input.orderType,
      page: input.page,
      take: input.take,
      isTotal: input.isTotal,
      includeDeleted: input.includeDeleted,
    });

    return this.peopleRepository.matching(
      new Criteria({
        filters: Filters.fromValues(query.filters),
        order: Order.fromValues(query.orderBy, query.orderType),
        page: query.page,
        take: query.take,
        isTotal: query.isTotal,
      })
    );
  }
}
