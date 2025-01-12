import { Component, Injectable, effect, inject } from '@angular/core';
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
  debounceTime,
  distinctUntilChanged,
} from 'rxjs';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import 'zone.js';
import { AsyncPipe, CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { objectChangedFields } from './custom-rxjs-operators/object-changed-fields';
import { objectValueChanged } from './custom-rxjs-operators/object-value-change';
import { rememberHistory } from './custom-rxjs-operators/remember-history';

type DataItem = {
  name: string;
  active: boolean;
};

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notification$ = new Subject<string>();

  listener$ = this.notification$.asObservable().pipe(
    tap((val) => console.log('NotificationService', val)),
    scan((acc) => acc + 1, 0),
    shareReplay({ bufferSize: 1, refCount: false })
    // shareReplay({ bufferSize: 1, refCount: true })
    // share()
  );

  notify(val: string) {
    this.notification$.next(val);
  }
}

@Injectable({ providedIn: 'root' })
export class UserAPIService {
  private data = [
    { name: 'user1', active: true },
    { name: 'user2', active: true },
    { name: 'user3', active: false },
  ];

  getUsersPromise(val?: string): Promise<DataItem[]> {
    return new Promise((res) =>
      setTimeout(() => {
        console.log('UserAPIService resolved', val);
        res(this.data);
      }, 200)
    );
  }

  getUsers() {
    return of(this.data).pipe(tap(() => console.log('UserAPIService')));
  }
}

@Injectable({ providedIn: 'root' })
export class GroupAPIService {
  private data = [
    { name: 'group1', active: true },
    { name: 'group2', active: true },
    { name: 'group3', active: false },
  ];

  getGroupPromise(val?: string): Promise<DataItem[]> {
    return new Promise((res) =>
      setTimeout(() => {
        console.log('GroupAPIService resolved', val);
        res(this.data);
      }, 200)
    );
  }

  getGroups() {
    return of(this.data).pipe(tap(() => console.log('GroupAPIService')));
  }
}

@Component({
  selector: 'app-form-tracker',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="myForm">
      <label>
        Name:
        <input formControlName="name" />
      </label>
      <label>
        Email:
        <input formControlName="email" />
      </label>
      <label>
        Age:
        <input formControlName="age" type="number" />
      </label>
    </form>
  `,
})
export class FormTrackerComponent {
  myForm = inject(FormBuilder).nonNullable.group({
    name: '',
    email: '',
    age: '',
  });

  constructor() {
    // Track changes in the form
    this.myForm.valueChanges
      .pipe(
        objectChangedFields(this.myForm.value)
        // debounceTime(800),
        // distinctUntilChanged()
        //objectValueChanged()
        //rememberHistory(4)
      )
      .subscribe((fieldChange) => {
        console.log('Changed fieldsa:', fieldChange);
      });
  }
}

@Component({
  selector: 'app-example-1',
  standalone: true,
  imports: [AsyncPipe, ReactiveFormsModule, FormTrackerComponent],
  styles: `
    div {
      margin-bottom: 16px;
    }
  `,
  template: `
  <!--<app-form-tracker />-->
    <label for="checkBox">check me</label>
    <input type="checkbox" name="checkBox" [formControl]="checkboxControl" />

    @if(displayItemsSignal(); as displayItemsSignal){

      @if(displayItemsSignal.status === 'loaded'){
    <div>
      results:
      @for(item of displayItemsSignal.data; track item.name){
        {{ item.name }}
      }
    </div>
      }
    }
<!-- 
    <div>
      active:
      @for(item of activeItems$ | async; track item.name){
        {{ item.name }}
      }
    </div>

    <div>
      results:
      @for(item of inActiveItems$ | async; track item.name){
        {{ item.name }}
      }
    </div> -->
  `,
})
export class ExampleComponent1 {
  private userAPIService = inject(UserAPIService);
  private groupAPIService = inject(GroupAPIService);

  checkboxControl = new FormControl<boolean>(false, { nonNullable: true });

  // displayItems$ = this.checkboxControl.valueChanges.pipe(
  //   startWith(this.checkboxControl.value),
  //   tap(() => console.log('-----')),
  //   switchMap((val) =>
  //     val
  //       ? from(this.userAPIService.getUsersPromise())
  //       : from(this.groupAPIService.getGroupPromise())
  //   )
  // );

  // displayItems$ = this.checkboxControl.valueChanges.pipe(
  //   startWith(this.checkboxControl.value),
  //   tap(() => console.log('-----')),
  //   switchMap((val) =>
  //     iif(
  //       () => val,
  //       from(this.userAPIService.getUsersPromise()),
  //       from(this.groupAPIService.getGroupPromise())
  //     )
  //   )
  // );

  // displayItems$ = this.checkboxControl.valueChanges.pipe(
  //   startWith(this.checkboxControl.value),
  //   tap(() => console.log('-----')),
  //   switchMap((val) =>
  //     iif(
  //       () => val,
  //       defer(() => from(this.userAPIService.getUsersPromise())),
  //       defer(() => from(this.groupAPIService.getGroupPromise()))
  //     )
  //   )
  // );

  //displayItems$ = defer(() => from(this.userAPIService.getUsersPromise()));
  // displayItems$ = from(this.userAPIService.getUsersPromise());

  // displayItemsSignal = toSignal(
  //   this.checkboxControl.valueChanges.pipe(
  //     switchMap((isChecked) =>
  //       iif(
  //         () => isChecked,
  //         defer(() => from(this.userAPIService.getUsersPromise())),
  //         of([])
  //       )
  //     )
  //   ),
  //   { initialValue: [] }
  // );

  // displayItemsSignal = toSignal(
  //   this.checkboxControl.valueChanges.pipe(
  //     switchMap((isChecked) =>
  //       isChecked
  //         ? this.userAPIService.getUsers()
  //         : this.groupAPIService.getGroups()
  //     )
  //   ),
  //   { initialValue: [] }
  // );

  // displayItemsSignal = toSignal(
  //   race(
  //     this.userAPIService.getUsers().pipe(
  //       delay(300),
  //       map((data) => ({
  //         status: 'loaded' as const,
  //         data,
  //       }))
  //     ),
  //     of({
  //       status: 'failed' as const,
  //     }).pipe(delay(500))
  //   ).pipe(
  //     startWith({
  //       status: 'loading' as const,
  //     })
  //   ),
  //   { initialValue: { status: 'loading' } }
  // );

  displayItemsSignal = toSignal(
    this.userAPIService.getUsers().pipe(
      delay(1300),
      map((data) => ({
        status: 'loaded' as const,
        data,
      })),
      startWith({
        status: 'loading' as const,
      }),
      timeout({
        each: 1000,
        with: () => of({ status: 'failed' as const }),
      })
    ),
    { initialValue: { status: 'loading' as const } }
  );

  constructor() {
    effect(() => console.log('displayItemsSignal', this.displayItemsSignal()));
    // I want to subscribe maybe after some time
  }

  // activeItems$ = this.displayItems$.pipe(
  //   map((items) => items.filter((d) => d.active))
  // );
  // inActiveItems$ = this.displayItems$.pipe(
  //   map((items) => items.filter((d) => !d.active))
  // );

  // private notificationService = inject(NotificationService);

  // constructor() {
  //   // somewhere 2 notifications happened
  //   this.notificationService.notify('a');
  //   this.notificationService.notify('b');

  //   // let's start listening on updates and navigate away
  //   this.notificationService.listener$
  //     .pipe(take(2))
  //     .subscribe((d) => console.log('sub 1', d));

  //   // listen forewer
  //   // this.notificationService.listener$.subscribe((d) =>
  //   //   console.log('sub 2', d)
  //   // );

  //   // somewhere 4 notifications happened
  //   this.notificationService.notify('c');
  //   this.notificationService.notify('d');
  //   this.notificationService.notify('e');
  //   this.notificationService.notify('f');
  //   this.notificationService.notify('g');
  //   this.notificationService.notify('h');

  //   setTimeout(() => {
  //     // let's start listening again
  //     this.notificationService.listener$.subscribe((d) =>
  //       console.log('sub 1', d)
  //     );

  //     // create another notification
  //     this.notificationService.notify('i');
  //   }, 1000);
  // }
}
