import { FieldPacket, Pool, RowDataPacket } from 'mysql2/promise';

import {
  Criteria,
  Filters,
  Logger,
  MysqlCriteriaConverter,
  Order,
  Query,
  UserAuthProvider,
} from '../../../../src/common';

import { Config } from '../../../../src/config';
import { People } from '../../../../src/domain/entities/people.entity';
import { PeopleMysqlRepository } from '../../../../src/infrastructure/repositories/people-mysql.repository';
import { PeopleDomain, PeopleMapper } from '../../../../src/infrastructure/mappers/people.mapper';

jest.mock('@common');
jest.mock('mysql2/promise');

describe('PeopleMysqlRepository', () => {
  let repo: PeopleMysqlRepository,
    mockConfig: Config,
    mockLogger: jest.Mocked<Logger>,
    mockUserAuthProvider: jest.Mocked<UserAuthProvider>,
    mockDb: jest.Mocked<Pool>,
    mockCriteriaConverter: jest.Mocked<MysqlCriteriaConverter>;

  beforeEach(() => {
    mockConfig = { PEOPLE_TABLE_NAME: 'people' } as Config;
    mockLogger = { error: jest.fn() } as unknown as jest.Mocked<Logger>;
    mockUserAuthProvider = {
      get: jest.fn().mockReturnValue({ document: 'user-doc' }),
    } as unknown as jest.Mocked<UserAuthProvider>;
    mockDb = mockDb = {
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

    repo = new PeopleMysqlRepository(
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
        .mockResolvedValueOnce([
          [
            {
              id: '5c9ad7f3-5df0-44e6-bea4-12349d8b1031',
              name: 'John Doe',
              height: 180,
              mass: 75,
              hairColor: 'brown',
              skinColor: 'white',
              eyeColor: 'blue',
              birthYear: '2024-01-12',
              gender: 'male',
            } as RowDataPacket,
          ],
          [] as FieldPacket[],
        ])
        .mockResolvedValueOnce([[{ total: 1 } as RowDataPacket], [] as FieldPacket[]]);

      const query = new Query({
          filters: [],
        }),
        result = await repo.matching(
          new Criteria({
            filters: Filters.fromValues(query.filters),
            order: Order.fromValues(query.orderBy, query.orderType),
            page: query.page,
            take: query.take,
            isTotal: query.isTotal,
          })
        );

      console.log(result);
      expect(mockDb.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        people: [
          PeopleMapper.toDomain({
            id: '5c9ad7f3-5df0-44e6-bea4-12349d8b1031',
            name: 'John Doe',
            height: 180,
            mass: 75,
            hairColor: 'brown',
            skinColor: 'white',
            eyeColor: 'blue',
            birthYear: '2024-01-12',
            gender: 'male',
          } as PeopleDomain),
        ],
        total: 1,
        page: 1,
        take: 10,
        totalPages: 1,
      });
    });

    // it('should log and throw an error if the query fails', async () => {
    //   mockDb.query.mockRejectedValue(new Error('Query failed'));

    //   const query = new Query({
    //     filters: [],
    //   });

    //   await expect(
    //     repo.matching(
    //       new Criteria({
    //         filters: Filters.fromValues(query.filters),
    //         order: Order.fromValues(query.orderBy, query.orderType),
    //         page: query.page,
    //         take: query.take,
    //         isTotal: query.isTotal,
    //       })
    //     )
    //   ).rejects.toThrowError(AppError);

    //   expect(mockLogger.error).toHaveBeenCalledWith(
    //     expect.stringContaining('Error in PeopleRepository of matching')
    //   );
    // });
  });

  describe('create', () => {
    it('should insert a new person into the database', async () => {
      const mockPerson = People.create({
        name: 'John Doe',
        height: 180,
        mass: 75,
        hairColor: 'brown',
        skinColor: 'white',
        eyeColor: 'blue',
        birthYear: '2024-01-12',
        gender: 'male',
      });
      jest.spyOn(mockUserAuthProvider, 'get').mockReturnValue({
        id: '5c9ad7f3-5df0-44e6-bea4-12349d8b1031',
        name: 'John Doe',
        document: '78549612',
        email: 'jdoe@me.com',
        role: 'admin',
        isActive: true,
      });

      await repo.create(mockPerson);

      expect(mockDb.query).toHaveBeenCalledWith({
        sql: 'INSERT INTO people(name) VALUES (?)',
        values: ['John Doe'],
      });
    });

    // it('should log and throw an error if the insert fails', async () => {
    //   mockDb.query.mockRejectedValue(new Error('Insert failed'));
    //   const mockPerson = People.create({
    //     name: 'John Doe',
    //     height: 180,
    //     mass: 75,
    //     hairColor: 'brown',
    //     skinColor: 'white',
    //     eyeColor: 'blue',
    //     birthYear: '2024-01-12',
    //     gender: 'male',
    //   });

    //   await expect(repo.create(mockPerson)).rejects.toThrowError(AppError);

    //   expect(mockLogger.error).toHaveBeenCalledWith(
    //     expect.stringContaining('Error in PeopleRepository of create')
    //   );
    // });
  });
});
