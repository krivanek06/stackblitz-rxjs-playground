import { MonoTypeOperatorFunction, filter } from 'rxjs';

export function filterNil<T>(): MonoTypeOperatorFunction<T> {
  return (source) => source.pipe(filter((d) => d !== null && d !== undefined));
}
