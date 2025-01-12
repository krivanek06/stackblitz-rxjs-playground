import {
  MonoTypeOperatorFunction,
  OperatorFunction,
  switchMap,
  startWith,
  map,
  timer,
  Observable,
  tap,
  retry,
  timeout,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

export function dataPolling<T>(data: {
  url: string;
  reloadSeconds: number;
}): MonoTypeOperatorFunction<T> {
  const http = inject(HttpClient);

  return (source) =>
    source.pipe(
      switchMap(() =>
        timer(0, data.reloadSeconds * 1000).pipe(
          // log reloading
          tap(() => console.log('reloading', new Date())),
          switchMap(() => http.get<T>(data.url))
        )
      )
    );
}
