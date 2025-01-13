import { Component, Injectable, effect, inject } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import {
  timeout,
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
} from "rxjs";
import "zone.js";
import { AsyncPipe } from "@angular/common";
import { toSignal } from "@angular/core/rxjs-interop";
import { ExampleComponent1 } from "./example-1";
import {
  loadingStatus,
  multiplyBy,
  multiplyByNew,
} from "./custom-rxjs-operators/loading-status";
import { HttpClient, provideHttpClient } from "@angular/common/http";
import { dataPolling } from "./custom-rxjs-operators/data-polling";
import { retryAttempt } from "./custom-rxjs-operators/retry-attempt";
import { ExampleFormComponent } from "./components/example-form.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [AsyncPipe, ExampleFormComponent, ExampleComponent1],
  styles: `
    div {
      margin-bottom: 16px;
    }
  `,
  template: `
    <!--<app-example-1 />-->
    <app-example-form />
  `,
})
export class App {
  private http = inject(HttpClient);
  testAPI = "https://dummyjson.com/users/filter?key=hair.color&value=Brown";
  testAPIError = "https://err.com";

  constructor() {
    const source$ = of(1, 2, 3);
    source$.pipe(multiplyBy(6)).subscribe(console.log);
    source$.pipe(multiplyByNew(6)).subscribe(console.log);

    this.http
      .get(this.testAPIError)
      .pipe(
        dataPolling({
          url: this.testAPIError,
          reloadSeconds: 5,
        }),
        retryAttempt(),
        loadingStatus()
      )
      .subscribe(console.log);

    // todo - maybe example with merge and scan to create memory ?
  }
}

bootstrapApplication(App, {
  providers: [provideHttpClient()],
});
