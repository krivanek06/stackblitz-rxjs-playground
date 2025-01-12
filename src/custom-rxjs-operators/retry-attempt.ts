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
  EMPTY,
  catchError,
  expand,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

export function retryAttempt<T>(
  data: {
    timeout: number;
    retryCount: number;
    retryDelay: number;
  } = {
    timeout: 5000,
    retryCount: 4,
    retryDelay: 1000,
  }
): MonoTypeOperatorFunction<T> {
  return (source) =>
    source.pipe(
      timeout(data.timeout),
      retry({
        count: data.retryCount,
        delay: data.retryDelay,
      })
    );
}
