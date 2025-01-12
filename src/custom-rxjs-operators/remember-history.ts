import { OperatorFunction, scan } from 'rxjs';

// TODO - can be used in websocket connection when receving a new object

type RememberMemory<T, K = T> = {
  previous: null | K;
  current: T;
  historyChain: unknown[]; // maybe better casting ???
};

/**
 * creates a memory for the chaing of values,
 * to access current, previous and more data
 */
export function rememberHistory<T>(
  memory = 1
): OperatorFunction<T, RememberMemory<T>> {
  return (source) =>
    source.pipe(
      scan(
        (acc, curr) => ({
          current: curr,
          previous: acc.current,
          historyChain: [...acc.historyChain.slice(-(memory - 1)), curr],
        }),
        {
          current: null as T, // ignoring initial null
          previous: null,
          historyChain: [],
        } as RememberMemory<T>
      )
    );
}
