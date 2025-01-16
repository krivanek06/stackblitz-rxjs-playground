import {
  timeout,
  catchError,
  Subject,
  delay,
  race,
  pairwise,
  forkJoin,
  map,
  of,
  scan,
  share,
  shareReplay,
  tap,
  iif,
  switchMap,
  startWith,
  mergeMap,
  filter,
  take,
  defer,
  from,
  raceWith,
  combineLatest,
  Observable,
  MonoTypeOperatorFunction,
  OperatorFunction,
} from "rxjs";

// old format
export function multiplyBy(val = 2): MonoTypeOperatorFunction<number> {
  return (source: Observable<number>): Observable<number> =>
    new Observable<number>((subscriber) => {
      return source.pipe(map((d) => d * val)).subscribe({
        next(value) {
          subscriber.next(value);
        },
        error(err) {
          subscriber.error(err);
        },
        complete() {
          subscriber.complete();
        },
      });
    });
}

// different format
export function multiplyByNew(val = 2): MonoTypeOperatorFunction<number> {
  return (source) => source.pipe(map((d) => d * val));
}

type RxResourceResult<T> = {
  state: "loading" | "loaded" | "error";
  isLoading: boolean;
  data: T | null;
  error?: unknown;
};

/**
 * used mainly for API requests to include HTTP state and additional data
 * about the HTTP call. Similar to rxResource
 */
export function loadingStatus<T>(): OperatorFunction<T, RxResourceResult<T>> {
  return (source) =>
    source.pipe(
      map((result) => ({
        state: "loaded" as const,
        data: result,
      })),
      // // setup loading state
      startWith({
        state: "loading" as const,
        data: null,
      }),
      // // handle error state
      catchError((error) =>
        of({
          state: "error" as const,
          error,
          data: null,
        })
      ),
      // // map the result to the expected type
      map(
        (result) =>
          ({
            ...result,
            isLoading: result.state === "loading",
          } satisfies RxResourceResult<T>)
      )
    );
}
