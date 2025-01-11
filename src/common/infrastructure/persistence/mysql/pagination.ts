import { QueryPage } from '../../../domain/criteria/query';

export interface SqlPagination {
  page: number;
  limit: number;
  offset?: number;
}

export function sqlPaginationResolver(input: QueryPage): SqlPagination {
  const DEFAULT_PAGE = 1,
    DEFAULT_LIMIT = 50,
    MAX_LIMIT = 1000;

  const limit = Math.min(Number(input.take) || DEFAULT_LIMIT, MAX_LIMIT),
    page = Math.max(Number(input.page) || DEFAULT_PAGE, DEFAULT_PAGE);

  return { page, limit, offset: (page - 1) * limit };
}
