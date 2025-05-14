import { Component, OnInit } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import * as countries from 'i18n-iso-countries';
import * as currencyCodes from 'currency-codes';
import enLocations from 'i18n-iso-countries/langs/en.json';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, startWith, map, of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { OrderService } from '../order.service';
import { CreateOrderDto } from '../order';
import {
  debounceTime,
  switchMap,
  map as rxMap,
  catchError,
  distinctUntilChanged,
} from 'rxjs/operators';

countries.registerLocale(enLocations);

@Component({
  selector: 'app-order-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Material
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatGridListModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
  ],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.css',
})
export class OrderFormComponent implements OnInit {
  orderForm: FormGroup;
  countries: { name: string; code: string }[];
  currencies: { name: string; code: string }[];
  countryCtrl = new FormControl('');
  currencyCtrl = new FormControl('');
  filteredCountries?: Observable<{ name: string; code: string }[]>;
  filteredCurrencies?: Observable<{ name: string; code: string }[]>;
  today: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private orderService: OrderService
  ) {
    this.countries = Object.entries(countries.getNames('en')).map(
      ([code, name]) => ({
        code,
        name,
      })
    );

    this.currencies = currencyCodes.data.map((currency) => ({
      code: currency.code,
      name: `${currency.currency} (${currency.code})`,
    }));

    this.orderForm = this.fb.group({
      orderNumber: [
        '',
        {
          validators: [Validators.required],
          asyncValidators: [this.orderNumberExistsValidator.bind(this)],
          updateOn: 'blur',
        },
      ],
      paymentDueDate: [
        '',
        [
          Validators.required,
          (control: AbstractControl) => {
            if (!control.value) return null;
            const selected = new Date(control.value);
            const now = new Date();
            selected.setHours(0, 0, 0, 0);
            now.setHours(0, 0, 0, 0);
            return selected < now ? { pastDate: true } : null;
          },
        ],
      ],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      currency: ['', Validators.required],
      streetAddress: ['', Validators.required],
      town: ['', Validators.required],
      country: ['', Validators.required],
      paymentDescription: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.filteredCountries = this.countryCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterCountries(value || ''))
    );

    this.filteredCurrencies = this.currencyCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterCurrencies(value || ''))
    );

    this.orderForm.get('country')?.valueChanges.subscribe((code) => {
      const found = this.countries.find((c) => c.code === code);
      if (found && this.countryCtrl.value !== found.name) {
        this.countryCtrl.setValue(found.name, { emitEvent: false });
      }
    });

    this.orderForm.get('currency')?.valueChanges.subscribe((code) => {
      const found = this.currencies.find((c) => c.code === code);
      if (found && this.currencyCtrl.value !== found.name) {
        this.currencyCtrl.setValue(found.name, { emitEvent: false });
      }
    });
  }

  private _filterCountries(value: string): { name: string; code: string }[] {
    const filterValue = value.toLowerCase();
    return this.countries.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }
  private _filterCurrencies(value: string): { name: string; code: string }[] {
    const filterValue = value.toLowerCase();
    return this.currencies.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  onCountrySelected(event: any) {
    const found = this.countries.find((c) => c.name === event.option.value);

    if (found) {
      this.orderForm.patchValue({ country: found.code });
    }
  }

  onCurrencySelected(event: any) {
    const found = this.currencies.find((c) => c.name === event.option.value);

    if (found) {
      this.orderForm.patchValue({ currency: found.code });
    }
  }

  submit() {
    if (this.orderForm.invalid) {
      return;
    }

    const formValue = this.orderForm.value;

    const payload: CreateOrderDto = {
      ...formValue,
      amount: Math.round(
        Number(formValue.amount.toString().replace(/,/g, '')) * 100
      ),
      paymentDueDate: new Date(formValue.paymentDueDate).toISOString(),
    };

    this.orderService.createOrder(payload).subscribe({
      next: () => {
        this.snackBar.open('Order created successfully!', 'OK', {
          duration: 3000,
        });
        this.orderForm.reset();
        this.router.navigate(['/list']);
      },
      error: (err) => {
        this.snackBar.open(
          'Error: ' + err.error?.message || 'Unknown error',
          'OK',
          { duration: 5000 }
        );
      },
    });
  }

  orderNumberExistsValidator(
    control: AbstractControl
  ): Observable<{ orderNumberExists: boolean } | null> {
    if (!control.value) {
      return of(null);
    }
    return of(control.value).pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((orderNumber) =>
        this.orderService.existsOrderNumber(orderNumber).pipe(
          rxMap((exists) => (exists ? { orderNumberExists: true } : null)),
          catchError(() => of(null))
        )
      )
    );
  }
}
