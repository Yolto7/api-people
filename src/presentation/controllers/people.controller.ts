import { APIGatewayProxyEvent } from 'aws-lambda';

import { AppSuccess, sanitize } from '@common';

import { PeopleQueriesService } from '@application/services/queries/people.query.service';
import { PeopleCreateCommandService } from '@application/services/commands/people-create.command.service';
import { PeopleMapper } from '@infrastructure/mappers/people.mapper';
import { PeopleValidator } from '@presentation/validators/people.validator';

export class PeopleController {
  constructor(
    private readonly peopleQueriesService: PeopleQueriesService,
    private readonly peopleCreateCommandService: PeopleCreateCommandService
  ) {}

  async getById(event: APIGatewayProxyEvent) {
    const person = await this.peopleQueriesService.getById(sanitize(event.pathParameters?.id));
    return AppSuccess.status(200).json({
      message: 'Person obtained successfully',
      data: PeopleMapper.toPresentation(person),
    });
  }

  async search(_event: APIGatewayProxyEvent) {
    const { people, total, page, take, totalPages } = await this.peopleQueriesService.search();
    return AppSuccess.status(200).json({
      message: 'People obtained successfully',
      data: {
        people: people.map((e) => PeopleMapper.toPresentation(e)),
        total,
        page,
        take,
        totalPages,
      },
    });
  }

  async getSwapiAll(_event: APIGatewayProxyEvent) {
    return AppSuccess.status(200).json({
      message: 'People swapi obtained successfully',
      data: await this.peopleQueriesService.getSwapiAll(),
    });
  }

  async create(event: APIGatewayProxyEvent) {
    await this.peopleCreateCommandService.handle(PeopleValidator.create(event.body));
    return AppSuccess.status(200).json({
      message: 'People created successfully',
    });
  }
}
