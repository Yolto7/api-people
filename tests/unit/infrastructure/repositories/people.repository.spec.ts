import { FieldPacket, Pool, RowDataPacket } from 'mysql2/promise';

import {
  Criteria,
  Filters,
  Logger,
  MysqlCriteriaConverter,
  Order,
  Query,
  UserAuthProvider,
} from '@common';
import { Config } from '@config';
import { People } from '@domain/entities/people.entity';
import { PeopleMysqlRepository } from '@infrastructure/repositories/people-mysql.repository';
import { PeopleDomain, PeopleMapper } from '@infrastructure/mappers/people.mapper';

jest.mock('mysql2/promise');

describe('PeopleMysqlRepository', () => {
  let repository: PeopleMysqlRepository;
  let mockConfig: Config;
  let mockLogger: jest.Mocked<Logger>;
  let mockUserAuthProvider: jest.Mocked<UserAuthProvider>;
  let mockDb: jest.Mocked<Pool>;
  let mockCriteriaConverter: jest.Mocked<MysqlCriteriaConverter>;

  const mockPeopleData = {
    id: '5c9ad7f3-5df0-44e6-bea4-12349d8b1031',
    name: 'John Doe',
    height: 180,
    mass: 75,
    hairColor: 'brown',
    skinColor: 'white',
    eyeColor: 'blue',
    birthYear: '2024-01-12',
    gender: 'male',
  } as RowDataPacket;

  const mockUserAuthData = {
    id: '5c9ad7f3-5df0-44e6-bea4-12349d8b1032',
    name: 'John Doe',
    document: '78549612',
    email: 'jdoe@me.com',
    role: 'admin',
    isActive: true,
  };

  beforeEach(() => {
    mockConfig = { PEOPLE_TABLE_NAME: 'people' } as Config;
    mockLogger = { error: jest.fn() } as unknown as jest.Mocked<Logger>;
    mockUserAuthProvider = {
      get: jest.fn().mockReturnValue(mockUserAuthData),
    } as unknown as jest.Mocked<UserAuthProvider>;
    mockDb = {
      getConnection: jest.fn().mockResolvedValue({
        beginTransaction: jest.fn(),
        query: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn(),
      }),
      query: jest.fn(),
      end: jest.fn(),
    } as unknown as jest.Mocked<Pool>;
    mockCriteriaConverter = {
      convert: jest.fn().mockReturnValue({
        filter: '',
        sort: '',
        pagination: '',
        values: [],
        page: 1,
        take: 10,
      }),
    } as unknown as jest.Mocked<MysqlCriteriaConverter>;

    repository = new PeopleMysqlRepository(
      mockConfig,
      mockLogger,
      mockUserAuthProvider,
      mockDb,
      mockCriteriaConverter
    );
  });

  describe('matching', () => {
    it('should return a list of people with pagination info', async () => {
      mockDb.query
        .mockResolvedValueOnce([[mockPeopleData], [] as FieldPacket[]])
        .mockResolvedValueOnce([[{ total: 1 } as RowDataPacket], [] as FieldPacket[]]);

      const query = new Query({ filters: [] }),
        result = await repository.matching(
          new Criteria({
            filters: Filters.fromValues(query.filters),
            order: Order.fromValues(query.orderBy, query.orderType),
            page: query.page,
            take: query.take,
            isTotal: query.isTotal,
          })
        );

      expect(mockDb.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        people: [PeopleMapper.toDomain(mockPeopleData as PeopleDomain)],
        total: 1,
        page: 1,
        take: 10,
        totalPages: 1,
      });
    });
  });

  describe('create', () => {
    it('should insert a new person into the database', async () => {
      await repository.create(
        People.create({
          name: 'John Doe',
          height: 180,
          mass: 75,
          hairColor: 'brown',
          skinColor: 'white',
          eyeColor: 'blue',
          birthYear: '2024-01-12',
          gender: 'male',
        })
      );

      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });
  });
});
