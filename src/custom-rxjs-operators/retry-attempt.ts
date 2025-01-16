import { MonoTypeOperatorFunction, retry, timeout } from "rxjs";

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
