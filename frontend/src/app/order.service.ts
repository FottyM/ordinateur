import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from './order';
import { CreateOrderDto } from './order';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  constructor(private readonly http: HttpClient) {}

  loadOrder(filter: {
    paymentDescription?: string;
    country?: string;
    limit?: number;
    offset?: number;
  }) {
    let params = new HttpParams();

    if (filter.paymentDescription) {
      params = params.set('paymentDescription', filter.paymentDescription);
    }

    if (filter.country) {
      params = params.set('country', filter.country);
    }

    if (filter.limit !== undefined) {
      params = params.set('limit', filter.limit.toString());
    }

    if (filter.offset !== undefined) {
      params = params.set('offset', filter.offset.toString());
    }

    return this.http.get<{ total: number; data: Order[] }>(this.apiUrl, {
      params,
    });
  }

  createOrder(order: CreateOrderDto) {
    return this.http.post(this.apiUrl, order);
  }

  existsOrderNumber(orderNumber: string) {
    return this.http.get<boolean>(`${this.apiUrl}/${orderNumber}/exists`);
  }
}
