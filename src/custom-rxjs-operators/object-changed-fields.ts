import { FormGroup } from '@angular/forms';
import { OperatorFunction, scan, startWith, map, pairwise } from 'rxjs';

/**
 * operator that returns changed fields for a form
 */
export function objectChangedFields<T extends Object>(
  initial: T
): OperatorFunction<
  Partial<T>,
  {
    viewArray: (keyof T)[];
    viewObject: Record<keyof T, boolean>;
  }
> {
  // Identify which fields have changed between two states.
  const getChangedFields = (
    initial: T,
    current: Partial<T>
  ): Partial<keyof T>[] => {
    return Object.keys(current).filter(
      (key) => initial[key as keyof T] !== current[key as keyof T]
    ) as Partial<keyof T>[];
  };

  // Identify which fields have changed between two states.
  const getChangedFieldsObject = (
    initial: T,
    changedKeys: Partial<keyof T>[]
  ): Record<keyof T, boolean> => {
    return Object.keys(initial).reduce(
      (acc, curr) => ({
        ...acc,
        [curr]: changedKeys.includes(curr as keyof T),
      }),
      {} as Record<keyof T, boolean>
    );
  };

  return (source) =>
    source.pipe(
      // start with the initial form state
      startWith(initial),
      // get changed fields
      map((curr) => getChangedFields(initial, curr)),
      // remember all changed field
      scan(
        (acc, curr) => [...new Set([...acc, ...curr])],
        [] as Partial<keyof T>[]
      ),
      // map to different views
      map((fields) => ({
        viewArray: fields,
        viewObject: getChangedFieldsObject(initial, fields),
      }))
    );
}
