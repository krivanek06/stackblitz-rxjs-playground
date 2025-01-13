import { MonoTypeOperatorFunction, filter } from "rxjs";

/**
 * filter out null and undefined value from a pipe chaing
 */
export function filterNil<T>(): MonoTypeOperatorFunction<T> {
  return (source) => source.pipe(filter((d) => d !== null && d !== undefined));
}
