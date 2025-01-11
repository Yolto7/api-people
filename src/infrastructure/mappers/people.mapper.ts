import { UniqueEntityId, UniqueId } from '@common';

import { People, PeopleCreateProps } from '@domain/entities/people.entity';

export interface PeopleDomain extends PeopleCreateProps {
  id: UniqueId;
}

interface PeopleCreatePersistence extends PeopleCreateProps {
  id: UniqueId;
}

interface PeoplePresentation {
  id: UniqueId;
  name: string;
  height: number;
  mass: number;
  hairColor: string;
  skinColor: string;
  eyeColor: string;
  birthYear: string;
  gender: string;
  createdAt: string;
}

export class PeopleMapper {
  static toDomain(input: PeopleDomain) {
    return People.create(
      {
        name: input.name,
        height: input.height,
        mass: input.mass,
        hairColor: input.hairColor,
        skinColor: input.skinColor,
        eyeColor: input.eyeColor,
        birthYear: input.birthYear,
        gender: input.gender,
        createdAt: input.createdAt,
      },
      new UniqueEntityId(input.id)
    );
  }

  static toCreatePersistence(people: People): PeopleCreatePersistence {
    return {
      id: people.id,
      name: people.name,
      height: people.height,
      mass: people.mass,
      hairColor: people.hairColor,
      skinColor: people.skinColor,
      eyeColor: people.eyeColor,
      birthYear: people.birthYear,
      gender: people.gender,

      ...people.newEntryAudit,
    };
  }

  static toUpdatePersistence(people: People): Partial<PeopleCreatePersistence> {
    return {
      id: people.id,
      ...people.getUpdates(),
    };
  }

  static toPresentation(people: People): PeoplePresentation {
    return {
      id: people.id,
      name: people.name,
      height: people.height,
      mass: people.mass,
      hairColor: people.hairColor,
      skinColor: people.skinColor,
      eyeColor: people.eyeColor,
      birthYear: people.birthYear,
      gender: people.gender,
      createdAt: people.newEntryAudit.createdAt as string,
    };
  }
}
