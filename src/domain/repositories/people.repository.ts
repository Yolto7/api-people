import { Criteria } from '@common';

import { People } from '@domain/entities/people.entity';

export interface MatchingInput {
  criteria: Criteria;
  isTotal: boolean;
}

export interface FilterResponse {
  people: People[];
  total: number;
  page: number;
  take: number;
  totalPages: number;
}

export interface PeopleRepository {
  matching(input: MatchingInput): Promise<FilterResponse>;
  create(input: People): Promise<void>;
}
