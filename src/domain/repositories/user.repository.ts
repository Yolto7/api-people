import { QueryPage, Criteria } from '@common';

import { User } from '@domain/entities/user.entity';

export interface FilterResponse extends QueryPage {
  users: User[];
}

export interface UserRepository {
  getById(email: string): Promise<User | null>;
  matching(criteria: Criteria): Promise<FilterResponse>;
  create(input: User): Promise<void>;
  update(input: User): Promise<void>;
}
