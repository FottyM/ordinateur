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
  ];
  dataSource = new MatTableDataSource<Order>([]);
  countries = Object.entries(countries.getNames('en')).map(([code, name]) => ({
    code,
    name,
  }));
  filters = { country: '', paymentDescription: '' };
  pageSize = 5;
  pageIndex = 0;
  totalOrders = 0;
  debugInfo: any = {};

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
    this.dataSource.paginator = this.paginator;
    this.paginator.page.subscribe((event) => {
      if (this.pageSize !== event.pageSize) {
        this.pageIndex = 0;
      } else {
        this.pageIndex = event.pageIndex;
      }
      this.pageSize = event.pageSize;
      this.loadOrders();
    });
  }

  loadOrders() {
    const offset = this.pageIndex * this.pageSize;
    this.debugInfo = {
      before: {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize,
        offset,
        totalOrders: this.totalOrders,
      },
    };
    this.orderService
      .loadOrder({
        ...this.filters,
        limit: this.pageSize,
        offset,
      })
      .subscribe((response) => {
        this.dataSource.data = response.data;
        this.totalOrders = response.total;
        this.debugInfo.after = {
          receivedDataLength: response.data.length,
          total: response.total,
          pageIndex: this.pageIndex,
          pageSize: this.pageSize,
          offset,
        };
      });
  }

  applyFilters() {
    this.pageIndex = 0;
    this.paginator.firstPage();
    this.loadOrders();
  }

  onFilterChange() {
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
}
