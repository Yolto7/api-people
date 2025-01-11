import { People } from '@domain/entities/people.entity';
import { PeopleRepository } from '@domain/repositories/people.repository';

export interface PeopleCreateInput {
  name: string;
  height: number;
  mass: number;
  hairColor: string;
  skinColor: string;
  eyeColor: string;
  birthYear: string;
  gender: string;
}

export class PeopleCreateCommandService {
  constructor(private readonly peopleRepository: PeopleRepository) {}

  handle(input: PeopleCreateInput) {
    return this.peopleRepository.create(
      People.create({
        name: input.name,
        height: input.height,
        mass: input.mass,
        hairColor: input.hairColor,
        skinColor: input.skinColor,
        eyeColor: input.eyeColor,
        birthYear: input.birthYear,
        gender: input.gender,
      })
    );
  }
}
