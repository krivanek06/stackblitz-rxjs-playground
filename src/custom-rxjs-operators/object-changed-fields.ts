import { OperatorFunction, map } from "rxjs";

type Booleanify<T> = {
  [K in keyof T]: T[K] extends object ? Booleanify<T[K]> : boolean;
};

/**
 * operator that returns changed fields for an object
 *
 * example:
 *  initial -> {a: 1, b: {c: 2 }}
 *
 * then later the object's value for 'c' is changed
 *  changed -> {a: 1, b: {c: 4 }}
 *
 * result will be:
 *
 * {
 *  viewArray: ['b.c']
 *  viewObject: {a: false, b: {c: true}}
 * }
 *
 */
export function objectChangedFields<T extends Object>(
  initial: T
): OperatorFunction<
  Partial<T>,
  {
    viewArray: string[];
    viewObject: Booleanify<T>;
  }
> {
  // Identify which fields have changed between two states.
  const getChangedFields = <K extends Object | Array<any>>(
    initial: K,
    current: Partial<K>,
    currentKey = ""
  ): string[] => {
    let changedKeys: string[] = [];
    for (const key of Object.keys(current)) {
      // value can be anything - string, number, object, etc.
      const previousValue = initial[key as keyof K] as any;
      const currentValue = current[key as keyof K] as any;

      // create key to save
      const newKey = currentKey !== "" ? `${currentKey}.${key}` : key;

      // if value is object - check child key and value changes
      if (currentValue instanceof Object) {
        // save nested path
        changedKeys.push(
          ...getChangedFields(previousValue, currentValue, newKey)
        );
        // go to next key
        continue;
      }

      // string or number comparison
      if (previousValue !== currentValue) {
        changedKeys.push(newKey);
      }
    }

    // return saved keys
    return changedKeys;
  };

  // Identify which fields have changed between two states.
  const getChangedFieldsObject = <K extends Object>(
    initial: Partial<K>,
    current: Partial<K>,
    cachedObj = {}
  ): Booleanify<K> => {
    for (const key of Object.keys(initial)) {
      // value can be anything - string, number, object, etc.
      const previousValue = initial[key as keyof K] as any;
      const currentValue = current[key as keyof K] as any;

      // if value is object - check child key and value changes
      if (currentValue instanceof Object) {
        // create nested object
        (cachedObj as any)[key] = {};
        // access nested cache
        const nestedCache = (cachedObj as any)[key];
        // check if nested key changed
        getChangedFieldsObject(previousValue, currentValue, nestedCache);
        // go to next key
        continue;
      }

      // string or number comparison
      (cachedObj as any)[key] = previousValue !== currentValue;
    }

    return cachedObj as Booleanify<K>;
  };

  return (source) =>
    source.pipe(
      map((data) => ({
        viewArray: getChangedFields(initial, data),
        viewObject: getChangedFieldsObject(initial, data),
      }))
    );
}
