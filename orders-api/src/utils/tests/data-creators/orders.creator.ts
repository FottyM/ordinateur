import { Order } from '@/modules/orders/entities/order.entity';
import { Repository } from 'typeorm';
import { generateOrder } from '../data-generators/orders.generator';

export async function createOrder(
  repository: Repository<Order>,
  data: Partial<Order> = {},
): Promise<Order> {
  const order = generateOrder(data);
  return await repository.save(order);
}

export async function createOrders(
  repository: Repository<Order>,
  dataArray: Partial<Order>[],
): Promise<Order[]> {
  const orders = dataArray.map(generateOrder);
  return await repository.save(orders);
}
