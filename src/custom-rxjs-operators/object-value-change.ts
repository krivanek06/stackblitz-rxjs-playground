import { FormGroup } from '@angular/forms';
import {
  OperatorFunction,
  scan,
  startWith,
  map,
  pairwise,
  debounceTime,
  tap,
  MonoTypeOperatorFunction,
  filter,
} from 'rxjs';

/**
 * emits only when object values changed
 */
export function objectValueChanged<T extends Object>(
  config: {
    debounceTime: number;
  } = {
    debounceTime: 500,
  }
): MonoTypeOperatorFunction<Partial<T>> {
  // check which field changed in the form
  const isObjectValueChange = (prev: Partial<T>, curr: Partial<T>) => {
    return Object.keys(curr).some(
      (key) => prev[key as keyof T] !== curr[key as keyof T]
    );
  };

  return (source) =>
    source.pipe(
      // start with empty object maake first emit
      startWith({}),
      // wait for user's input typing
      debounceTime(config.debounceTime),
      // use previos and current form values
      pairwise(),
      // filter if form values changed
      filter(([prev, curr]) => isObjectValueChange(prev, curr)),
      // return current form values
      map(([_, curr]) => curr)
    );
}
