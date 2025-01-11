import { AggregateRoot, AuditEntry, cuidaRole, UniqueEntityId } from '@common';
import { UserCreatedDomainEvent } from '@domain/events/userCreated.event';

import { UserCellphone } from './valueObjects/cellphone.vo';
import { UserDocumentNumber } from './valueObjects/documentNumber.vo';
import { UserDocumentType } from './valueObjects/documentType.vo';
import { UserEmail } from './valueObjects/email.vo';
import { UserIsActive } from './valueObjects/isActive.vo';
import { UserIsVerified } from './valueObjects/isVerified.vo';
import { UserLastNames } from './valueObjects/lastNames.vo';
import { UserNames } from './valueObjects/names.vo';
import { UserPhoto } from './valueObjects/photo.vo';
import { UserRole } from './valueObjects/role.vo';
import { UserStatusTypes, UserStatus } from './valueObjects/status.vo';
import { UserIsUploadedPhoto } from './valueObjects/isUploadedPhoto.vo';
import { UserVerifiedDomainEvent } from '@domain/events/userVerified.event';
import { UserMetadata, UserMetadataProps } from './valueObjects/metadata.vo';

interface UserProps extends AuditEntry {
  documentType: UserDocumentType;
  documentNumber: UserDocumentNumber;
  names: UserNames;
  lastNames: UserLastNames;
  email: UserEmail;
  cellphone: UserCellphone;
  photo: UserPhoto;
  metadata: UserMetadata;
  role: UserRole;
  status: UserStatus;
  isActive: UserIsActive;
  isUploadedPhoto: UserIsUploadedPhoto;
  isVerified: UserIsVerified;
}

export interface UserCreateProps extends AuditEntry {
  documentType?: string;
  documentNumber?: string;
  names: string;
  lastNames: string;
  email: string;
  cellphone: string;
  photo?: string;
  metadata?: UserMetadataProps;
  role: cuidaRole;
  status: UserStatusTypes;
  isActive?: boolean;
  isUploadedPhoto?: boolean;
  isVerified?: boolean;

  password?: string;
}

export class User extends AggregateRoot<UserProps> {
  private constructor(props: UserProps, id?: UniqueEntityId) {
    super(props, id);
  }

  get documentType() {
    return this.props.documentType.value;
  }
  get documentNumber() {
    return this.props.documentNumber.value;
  }
  get names() {
    return this.props.names.value;
  }
  get lastNames() {
    return this.props.lastNames.value;
  }
  get email() {
    return this.props.email.value;
  }
  get cellphone() {
    return this.props.cellphone.value;
  }
  get metadata() {
    return this.props.metadata.value;
  }
  get photo() {
    return this.props.photo.value;
  }
  get role() {
    return this.props.role.value;
  }
  get status() {
    return this.props.status.value;
  }
  get isActive() {
    return this.props.isActive.value;
  }
  get isUploadedPhoto() {
    return this.props.isUploadedPhoto.value;
  }
  get isVerified() {
    return this.props.isVerified.value;
  }

  static create(props: UserCreateProps, id?: UniqueEntityId): User {
    const user = new User(
      {
        documentType: UserDocumentType.create(props.documentType || ''),
        documentNumber: UserDocumentNumber.create(props.documentNumber || ''),
        names: UserNames.create(props.names),
        lastNames: UserLastNames.create(props.lastNames),
        email: UserEmail.create(props.email),
        cellphone: UserCellphone.create(props.cellphone),
        metadata: UserMetadata.create(props.metadata || {}),
        photo: UserPhoto.create(props.photo || ''),
        role: UserRole.create(props.role),
        status: UserStatus.create(props.status),
        isActive: UserIsActive.create(props.isActive ?? true),
        isUploadedPhoto: UserIsUploadedPhoto.create(props.isUploadedPhoto ?? false),
        isVerified: UserIsVerified.create(props.isVerified ?? false),
      },
      id
    );

    !id &&
      props.password &&
      user.record(
        new UserCreatedDomainEvent({
          aggregateId: user.id,
          data: {
            names: props.names,
            email: props.email,
            role: props.role,
            password: props.password,
          },
        })
      );

    return user;
  }

  getUpdates() {
    const updates: Partial<UserCreateProps> = {};
    for (const [key, value] of Object.entries(this.props)) {
      value.isModified && (updates[key as keyof UserCreateProps] = value.value);
    }

    Object.assign(updates, this.updateEntryAudit);
    return updates;
  }

  activeState() {
    this.props.status = this.props.status.update(UserStatusTypes.ACTIVE);
    this.updateIsActive(true);
  }
  inactiveState() {
    this.props.status = this.props.status.update(UserStatusTypes.INACTIVE);
    this.updateIsActive(false);
  }

  updateDocumentType(value: string) {
    this.props.documentType = this.props.documentType.update(value);
  }
  updateDocumentNumber(value: string) {
    this.props.documentNumber = this.props.documentNumber.update(value);
  }
  updateNames(value: string) {
    this.props.names = this.props.names.update(value);
  }
  updateLastNames(value: string) {
    this.props.lastNames = this.props.lastNames.update(value);
  }
  updateEmail(value: string) {
    this.props.email = this.props.email.update(value);
  }
  updateCellphone(value: string) {
    this.props.cellphone = this.props.cellphone.update(value);
  }
  updateMetadata(value: UserMetadataProps) {
    this.props.metadata = this.props.metadata.update(value);
  }
  updatePhoto(value: string) {
    this.props.photo = this.props.photo.update(value);
    !this.isUploadedPhoto && this.updateIsUploadedPhoto(true);
  }
  updateIsActive(value: boolean) {
    this.props.isActive = this.props.isActive.update(value);
  }
  updateIsVerified(value: boolean) {
    this.props.isVerified = this.props.isVerified.update(value);
    this.record(
      new UserVerifiedDomainEvent({
        aggregateId: this.id,
        data: {
          email: this.email,
          isVerified: this.isVerified,
        },
      })
    );
  }
  updateIsUploadedPhoto(value: boolean) {
    this.props.isUploadedPhoto = this.props.isUploadedPhoto.update(value);
  }
}
