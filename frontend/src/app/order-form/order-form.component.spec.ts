import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  flush,
} from '@angular/core/testing';

import { OrderFormComponent } from './order-form.component';
import { OrderService } from '../order.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import {
  MatSnackBar,
  MatSnackBarRef,
  TextOnlySnackBar,
} from '@angular/material/snack-bar';

describe('OrderFormComponent', () => {
  let component: OrderFormComponent;
  let fixture: ComponentFixture<OrderFormComponent>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let orderServiceSpy: jasmine.SpyObj<OrderService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    orderServiceSpy = jasmine.createSpyObj('OrderService', ['createOrder']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    await TestBed.configureTestingModule({
      imports: [OrderFormComponent],
      providers: [
        { provide: OrderService, useValue: orderServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call createOrder with correct payload on submit', fakeAsync(() => {
    component.orderForm.setValue({
      orderNumber: 'TST123',
      paymentDueDate: new Date('2025-05-15'),
      amount: '1234.56',
      currency: 'USD',
      streetAddress: '123 Main St',
      town: 'Testville',
      country: 'EE',
      paymentDescription: 'Test order',
    });
    orderServiceSpy.createOrder.and.returnValue(of({}));
    component.submit();
    expect(orderServiceSpy.createOrder).toHaveBeenCalled();
    const payload = orderServiceSpy.createOrder.calls.mostRecent().args[0];
    expect(payload.orderNumber).toBe('TST123');
    expect(payload.amount).toBe(123456); // 1234.56 * 100
    expect(payload.currency).toBe('USD');
    expect(payload.country).toBe('EE');
    expect(payload.paymentDescription).toBe('Test order');
  }));

  it('should navigate to /list on successful order creation', fakeAsync(() => {
    component.orderForm.setValue({
      orderNumber: 'TST123',
      paymentDueDate: new Date('2025-05-15'),
      amount: '1234.56',
      currency: 'USD',
      streetAddress: '123 Main St',
      town: 'Testville',
      country: 'EE',
      paymentDescription: 'Test order',
    });
    orderServiceSpy.createOrder.and.returnValue(of({}));
    component.submit();
    tick();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/list']);
  }));
});
