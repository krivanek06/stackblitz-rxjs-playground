import { Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { objectChangedFields } from "../custom-rxjs-operators/object-changed-fields";
import { debounceTime, distinctUntilChanged } from "rxjs";
import { objectValueChanged } from "../custom-rxjs-operators/object-value-change";

@Component({
  selector: "app-example-form",
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

      <div class="border"></div>

      <!-- city -->
      <div formGroupName="address">
        <label>
          City:
          <input formControlName="city" />
        </label>
      </div>

      <div class="border"></div>

      <!-- items -->
      <div formArrayName="items">
        @for(control of myForm.controls.items.controls; track $index; let i =
        $index){
        <div [formGroupName]="i">
          <div>
            <label>
              Item name:
              <input formControlName="name" />
            </label>
          </div>

          <div>
            <label>
              Item amount:
              <input formControlName="amount" type="number" />
            </label>
          </div>
        </div>

        }
      </div>
    </form>
  `,
  styles: [
    `
      form {
        display: grid;
      }

      .border {
        padding-top: 8px;
        margin-bottom: 6px;
        border-bottom: 1px solid black;
      }
    `,
  ],
})
export class ExampleFormComponent {
  private readonly builder = inject(FormBuilder);

  myForm = this.builder.nonNullable.group({
    name: [""],
    email: [""],
    age: [""],
    address: this.builder.group({
      city: [""],
    }),
    items: this.builder.array([
      this.builder.group({
        name: [""],
        amount: [0],
      }),
    ]),
  });

  constructor() {
    // Track changes in the form
    this.myForm.valueChanges
      .pipe(
        // objectChangedFields(this.myForm.value)
        debounceTime(800),
        //distinctUntilChanged()
        objectValueChanged()
        //rememberHistory(4)
      )
      .subscribe((fieldChange) => {
        console.log("Changed fieldsa:", fieldChange);
      });
  }
}
