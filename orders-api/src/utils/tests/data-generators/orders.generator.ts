import { Order } from '@/modules/orders/entities/order.entity';
import { faker } from '@faker-js/faker';

export function generateOrder(data: Partial<Order> = {}): Order {
  return {
    orderNumber: faker.string.alphanumeric(10),
    paymentDescription: faker.commerce.productDescription(),
    streetAddress: faker.location.streetAddress(),
    town: faker.location.city(),
    country: faker.location.countryCode('alpha-2').toUpperCase(),
    currency: faker.finance.currencyCode().toUpperCase(),
    amount: faker.number.int({ min: 1, max: 10_000 }),
    paymentDueDate: faker.date.soon().toISOString(),
    ...data,
  } as Order;
}
