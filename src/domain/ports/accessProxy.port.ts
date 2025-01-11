import { UniqueId } from '@common';

export enum AccessTypes {
  BUILDING = 'BUILDING',
  EVENT = 'EVENT',
}

export enum AccessScheduleDay {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday',
}

export interface AccessScheduleType {
  day: AccessScheduleDay;
  startHour: string;
  endHour: string;
}

export interface AccessBuildingAccessMethodsProps {
  qr: boolean;
  facialRekognition: boolean;
  facialCamera: boolean;
}

export interface Access {
  id: UniqueId;
  type: AccessTypes;
  userId: UniqueId;
  buildingName: string;
  buildingAddress: string;
  buildingAccessMethods: AccessBuildingAccessMethodsProps;
  apartments: string[];
  parkingLots: string[];
  warehouses: string[];
  isOwner: boolean;
  isAllowedCreateGuests: boolean;
  isActive?: boolean;
}

export interface AccessCreateInput {
  type: AccessTypes;
  userId: UniqueId;
  ownerId?: UniqueId;
  buildingId: UniqueId;
  apartments: string[];
  parkingLots?: string[];
  warehouses?: string[];
  schedule?: AccessScheduleType[];
}

export interface AccessProxyPort {
  getById(id: UniqueId): Promise<Access>;
  create(input: AccessCreateInput): Promise<void>;
}
