import { randomUUID } from 'node:crypto';

export type UniqueId = string;

export class UniqueEntityId {
  private readonly value: UniqueId;

  constructor(id?: UniqueId) {
    this.value = id || randomUUID().toString();
  }

  get valueId() {
    return this.value;
  }

  static random(): UniqueId {
    return randomUUID().toString();
  }

  equals(id?: UniqueEntityId): boolean {
    if (id === null || id === undefined) {
      return false;
    }

    return id.value === this.value;
  }
}
