import { APIGatewayProxyEvent } from 'aws-lambda';

import { AppSuccess, sanitize } from '@common';

import { UserQueriesService } from '@application/services/queries/user.query.service';
import { UserMapper } from '@infrastructure/mappers/user.mapper';
import { UserUpdateCommandService } from '@application/services/commands/user-update.command.service';
import UserPrivateValidator from '@presentation/private/validators/user.validator';
import { UserPhotoUploadCommandService } from '@application/services/commands/userPhoto-upload.command.service';
import { UserVerifyCommandService } from '@application/services/commands/user-verifyCode.command.service';
import { UserResendCodeCommandService } from '@application/services/commands/user-resendCode.command.service';
import { UserPhotoCompareCommandService } from '@application/services/commands/userPhoto-compare.command.service';

export default class UserPrivateController {
  constructor(
    private readonly userQueriesService: UserQueriesService,
    private readonly userUpdateCommandService: UserUpdateCommandService,
    private readonly userPhotoUploadCommandService: UserPhotoUploadCommandService,
    private readonly userPhotoCompareCommandService: UserPhotoCompareCommandService,
    private readonly userResendCodeCommandService: UserResendCodeCommandService,
    private readonly userVerifyCommandService: UserVerifyCommandService
  ) {}

  async getById(event: APIGatewayProxyEvent) {
    const data = await this.userQueriesService.getById(sanitize(event.pathParameters?.id));
    return AppSuccess.status(200).json({
      message: 'User obtained successfully',
      data: UserMapper.toPresentation(data),
    });
  }

  async getByEmail(event: APIGatewayProxyEvent) {
    const data = await this.userQueriesService.getByEmail(sanitize(event.pathParameters?.email));
    return AppSuccess.status(200).json({
      message: 'User obtained successfully',
      data: UserMapper.toPresentation(data),
    });
  }

  async update(event: APIGatewayProxyEvent) {
    await this.userUpdateCommandService.execute(
      sanitize(event.pathParameters?.id),
      UserPrivateValidator.update(event.body)
    );
    return AppSuccess.status(200).json({
      message: 'User updated successfully',
    });
  }

  async uploadPhoto(event: APIGatewayProxyEvent) {
    await this.userPhotoUploadCommandService.execute(UserPrivateValidator.uploadPhoto(event.body));
    return AppSuccess.status(200).json({
      message: 'User photo uploaded successfully',
    });
  }

  async comparePhoto(event: APIGatewayProxyEvent) {
    return AppSuccess.status(200).json({
      message: 'Faces compared successfully',
      data: await this.userPhotoCompareCommandService.execute(
        UserPrivateValidator.uploadPhoto(event.body)
      ),
    });
  }

  async resendCode(_: APIGatewayProxyEvent) {
    await this.userResendCodeCommandService.execute();
    return AppSuccess.status(200).json({
      message: 'Verification code sent successfully',
    });
  }

  async verifyCode(event: APIGatewayProxyEvent) {
    await this.userVerifyCommandService.execute(UserPrivateValidator.verify(event.body));
    return AppSuccess.status(200).json({
      message: 'User verified successfully',
    });
  }
}
