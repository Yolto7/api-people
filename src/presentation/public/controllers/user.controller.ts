import { APIGatewayProxyEvent } from 'aws-lambda';

import { AppSuccess } from '@common';

import { UserCreateCommandService } from '@application/services/commands/user-create.command.service';
import UserPublicValidator from '@presentation/public/validators/user.validator';

export default class UserPublicController {
  constructor(private readonly userCreateCommandService: UserCreateCommandService) {}

  async create(event: APIGatewayProxyEvent) {
    await this.userCreateCommandService.execute(UserPublicValidator.create(event.body));
    return AppSuccess.status(201).json({
      message: 'User created successfully',
    });
  }
}
