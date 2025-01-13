import { FormGroup } from "@angular/forms";
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
} from "rxjs";

/**
 * creates a deep comparision between previous and current state
 * and emits only when object values changed (even for nested keys)
 */
export function objectValueChanged<T extends Object>(
  config: {
    debounceTime: number;
  } = {
    debounceTime: 500,
  }
): MonoTypeOperatorFunction<Partial<T>> {
  // check which field changed in the form
  const isObjectValueChange = (prev: Partial<T>, curr: Partial<T>): boolean => {
    return Object.keys(curr).some((key) => {
      // value can be anything - string, number, object, etc.
      const previousValue = prev[key as keyof T] as any;
      const currentValue = curr[key as keyof T] as any;

      // if value is object - check child key and value changes
      if (currentValue instanceof Object) {
        return isObjectValueChange(previousValue, currentValue);
      }

      return previousValue !== currentValue;
    });
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
