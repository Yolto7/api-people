import { ValueObject } from '../valueObject';

export type FilterValueTypes = string | number | boolean;

export class FilterValue extends ValueObject<FilterValueTypes> {
  constructor(value: FilterValueTypes) {
    super(value);
  }
}
