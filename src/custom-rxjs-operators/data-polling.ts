import {
  MonoTypeOperatorFunction,
  switchMap,
  timer,
  tap,
  Observable,
} from "rxjs";

/**
 * continuously polls data from a provided URL
 *
 * @param data
 *  - loader - a http call to load data
 *  - reloadSeconds - how often to poll the server
 */
export function dataPolling<T>(data: {
  loader: () => Observable<T>;
  reloadSeconds: number;
}): MonoTypeOperatorFunction<T> {
  return (source) =>
    source.pipe(
      switchMap(() =>
        timer(0, data.reloadSeconds * 1000).pipe(
          // log reloading
          tap(() => console.log("reloading", new Date())),
          switchMap(data.loader)
        )
      )
    );
}
