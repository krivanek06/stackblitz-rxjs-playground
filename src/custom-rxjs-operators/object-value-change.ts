import {
  startWith,
  map,
  pairwise,
  debounceTime,
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
  // check if any field (evem mested) changed in the object
  const isObjectValueChange = <K extends Object | {}>(
    prev: K,
    curr: K
  ): boolean => {
    return Object.keys(curr).some((key) => {
      // value can be anything - string, number, object, etc.
      const previousValue = prev[key as keyof K] as any;
      const currentValue = curr[key as keyof K] as any;

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
      // use previos and current object values
      pairwise(),
      // only filter changed values for the object
      filter(([prev, curr]) => isObjectValueChange(prev, curr)),
      // return current object
      map(([_, curr]) => curr)
    );
}
