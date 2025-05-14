import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { OrderService } from '../order.service';
import { Order } from '../order';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import * as countries from 'i18n-iso-countries';
import enLocations from 'i18n-iso-countries/langs/en.json';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { Observable, startWith, map } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Material
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css',
})
export class OrderListComponent implements OnInit, AfterViewInit {
  displayedColumns: Array<keyof Order> = [
    'orderNumber',
    'amount',
    'currency',
    'paymentDueDate',
    'paymentDescription',
    'country',
    'publicId',
  ];
  dataSource = new MatTableDataSource<Order>([]);
  countries = Object.entries(countries.getNames('en')).map(([code, name]) => ({
    code,
    name,
  }));
  filters = { country: '', paymentDescription: '' };
  pageSize = 30;
  pageIndex = 0;
  totalOrders = 0;
  isLoading = false;
  allLoaded = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private filterChanged$ = new Subject<void>();

  countryCtrl = new FormControl('');
  filteredCountries!: Observable<{ code: string; name: string }[]>;

  constructor(private readonly orderService: OrderService) {
    this.filterChanged$.pipe(debounceTime(300)).subscribe(() => {
      this.pageIndex = 0;
      if (this.paginator) {
        this.paginator.firstPage();
      }
      this.loadOrders();
    });
    countries.registerLocale(enLocations);
  }

  async ngOnInit(): Promise<void> {
    this.filteredCountries = this.countryCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterCountries(value || ''))
    );
    return this.loadOrders();
  }

  ngAfterViewInit() {
    // No paginator logic needed for infinite scroll
  }

  onScroll(event: any) {
    const element = event.target;
    if (
      element.scrollHeight - element.scrollTop <= element.clientHeight + 100 &&
      !this.isLoading &&
      !this.allLoaded
    ) {
      this.pageIndex++;
      this.loadOrders(true); // append
    }
  }

  loadOrders(append = false) {
    if (this.isLoading) return;
    this.isLoading = true;
    const offset = this.pageIndex * this.pageSize;
    this.orderService
      .loadOrder({
        ...this.filters,
        limit: this.pageSize,
        offset,
      })
      .subscribe((response) => {
        if (append) {
          this.dataSource.data = [...this.dataSource.data, ...response.data];
        } else {
          this.dataSource.data = response.data;
        }
        this.totalOrders = response.total;
        this.isLoading = false;
        if (this.dataSource.data.length >= this.totalOrders) {
          this.allLoaded = true;
        }
      });
  }

  applyFilters() {
    this.pageIndex = 0;
    this.paginator.firstPage();
    this.loadOrders();
  }

  onFilterChange() {
    this.pageIndex = 0;
    this.allLoaded = false;
    this.dataSource.data = [];
    this.filterChanged$.next();
  }

  private _filterCountries(value: string): { code: string; name: string }[] {
    const filterValue = value.toLowerCase();
    return this.countries.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }

  onCountrySelected(event: any) {
    const found = this.countries.find((c) => c.name === event.option.value);
    if (found) {
      this.filters.country = found.code;
      this.onFilterChange();
    }
  }

  getCountryName(code: string): string {
    const found = this.countries.find((c) => c.code === code);
    return found ? found.name : code;
  }

  getTotalAmount(): number {
    return this.dataSource.data.reduce(
      (sum, order) => sum + (order.amount || 0),
      0
    );
  }
}
