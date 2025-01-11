import { cuidaRole, UniqueEntityId, UniqueId } from '@common';

import { User, UserCreateProps } from '@domain/entities/user.entity';
import { UserMetadataProps } from '@domain/entities/valueObjects/metadata.vo';

interface UserCreatePersistence extends UserCreateProps {
  id: UniqueId;
}

interface UserPresentation {
  id: UniqueId;
  documentType: string;
  documentNumber: string;
  names: string;
  lastNames: string;
  email: string;
  cellphone: string;
  metadata: UserMetadataProps;
  role: cuidaRole;
  status: string;
  isActive: boolean;
  isUploadedPhoto: boolean;
  isVerified: boolean;
}

export class UserMapper {
  static toDomain(input: any) {
    return User.create(
      {
        documentType: input.documentType,
        documentNumber: input.documentNumber,
        names: input.names,
        lastNames: input.lastNames,
        email: input.email,
        cellphone: input.cellphone,
        metadata: input.metadata,
        photo: input.photo,
        role: input.role,
        status: input.status,
        isActive: input.isActive,
        isUploadedPhoto: input.isUploadedPhoto,
        isVerified: input.isVerified,
      },
      new UniqueEntityId(input.id)
    );
  }

  static toCreatePersistence(user: User): Partial<UserCreatePersistence> {
    return {
      id: user.id,
      documentType: user.documentType,
      documentNumber: user.documentNumber,
      names: user.names,
      lastNames: user.lastNames,
      email: user.email,
      cellphone: user.cellphone,
      metadata: user.metadata,
      photo: user.photo,
      role: user.role,
      status: user.status,
      isActive: user.isActive,
      isUploadedPhoto: user.isUploadedPhoto,
      isVerified: user.isVerified,

      ...user.newEntryAudit,
    };
  }

  static toUpdatePersistence(user: User) {
    return user.getUpdates();
  }

  static toPresentation(user: User): UserPresentation {
    return {
      id: user.id,
      documentType: user.documentType,
      documentNumber: user.documentNumber,
      names: user.names,
      lastNames: user.lastNames,
      email: user.email,
      cellphone: user.cellphone,
      metadata: user.metadata,
      role: user.role,
      status: user.status,
      isActive: user.isActive,
      isUploadedPhoto: user.isUploadedPhoto,
      isVerified: user.isVerified,
    };
  }
}
