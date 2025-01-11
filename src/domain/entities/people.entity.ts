import { AggregateRoot, AuditEntry, UniqueEntityId } from '@common';

import { PeopleName } from './valueObjects/name.vo';
import { PeopleHeight } from './valueObjects/height.vo';
import { PeopleMass } from './valueObjects/mass.vo';
import { PeopleHairColor } from './valueObjects/hairColor.vo';
import { PeopleSkincolor } from './valueObjects/skinColor.vo';
import { PeopleEyecolor } from './valueObjects/eyeColor.vo';
import { PeopleBirthyear } from './valueObjects/birthYear.vo';
import { PeopleGender } from './valueObjects/gender.vo';

interface PeopleProps extends AuditEntry {
  name: PeopleName;
  height: PeopleHeight;
  mass: PeopleMass;
  hairColor: PeopleHairColor;
  skinColor: PeopleSkincolor;
  eyeColor: PeopleEyecolor;
  birthYear: PeopleBirthyear;
  gender: PeopleGender;
}

export interface PeopleCreateProps extends AuditEntry {
  name: string;
  height: number;
  mass: number;
  hairColor: string;
  skinColor: string;
  eyeColor: string;
  birthYear: string;
  gender: string;
}

export class People extends AggregateRoot<PeopleProps> {
  private constructor(props: PeopleProps, id?: UniqueEntityId) {
    super(props, id);
  }

  get name() {
    return this.props.name.value;
  }
  get height() {
    return this.props.height.value;
  }
  get mass() {
    return this.props.mass.value;
  }
  get hairColor() {
    return this.props.hairColor.value;
  }
  get skinColor() {
    return this.props.skinColor.value;
  }
  get eyeColor() {
    return this.props.eyeColor.value;
  }
  get birthYear() {
    return this.props.birthYear.value;
  }
  get gender() {
    return this.props.gender.value;
  }

  static create(props: PeopleCreateProps, id?: UniqueEntityId): People {
    return new People(
      {
        name: PeopleName.create(props.name),
        height: PeopleHeight.create(props.height),
        mass: PeopleMass.create(props.mass),
        hairColor: PeopleHairColor.create(props.hairColor),
        skinColor: PeopleSkincolor.create(props.skinColor),
        eyeColor: PeopleEyecolor.create(props.eyeColor),
        birthYear: PeopleBirthyear.create(props.birthYear),
        gender: PeopleGender.create(props.gender),
        createdAt: props.createdAt,
      },
      id
    );
  }

  getUpdates() {
    const updates: Partial<PeopleCreateProps> = {};
    for (const [key, value] of Object.entries(this.props)) {
      value.isModified &&
        (updates[key as keyof PeopleCreateProps] =
          typeof value.value === 'object' ? JSON.stringify(value.value) : value.value);
    }

    Object.assign(updates, this.updateEntryAudit);
    return updates;
  }
}
