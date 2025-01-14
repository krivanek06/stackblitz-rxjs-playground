import { OperatorFunction, catchError, of } from "rxjs";

/**
 * handle errors in pipes. You can:
 * - inject some notification service and display error
 * - log the error into sentry or so
 * - some logic to display different message for different errors
 *
 * @param returnValue - value to return if error happens
 * @param errorMessage - error message to display to the user
 */
export function handleError<T, K>(
  returnValue: K,
  errorMessage = "Server Error"
): OperatorFunction<T, K | T> {
  return (source) =>
    source.pipe(
      catchError((err) => {
        // handle error
        console.log(err);

        return of(returnValue);
      })
    );
}
