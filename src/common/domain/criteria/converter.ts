export interface CriteriaConverter<T, K> {
  convert(input: T): K;
}
