import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { nanoid } from 'nanoid';
import { InjectRepository } from '@nestjs/typeorm';
import { GetOrdersQueryDto } from './dto/get-order-query.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const newOrder = this.orderRepository.create({
      ...createOrderDto,
      publicId: nanoid(10),
    });
    const createOrder = await this.orderRepository.save(newOrder);
    return createOrder;
  }

  async exists(orderNumber: string): Promise<boolean> {
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
      select: ['orderNumber'],
    });
    return !!order;
  }

  async findAll(
    filters: GetOrdersQueryDto,
  ): Promise<{ total: number; data: Order[] }> {
    const query = this.orderRepository.createQueryBuilder('order');

    if (filters.country) {
      query.andWhere('order.country = :country', { country: filters.country });
    }

    if (filters.paymentDescription) {
      query.andWhere('order.paymentDescription ILIKE :desc', {
        desc: `%${filters.paymentDescription}%`,
      });
    }

    query
      .orderBy('order.countryPriority', 'ASC')
      .addOrderBy('order.paymentDueDate', 'ASC')
      .take(filters.limit)
      .skip(filters.offset);

    const [data, total] = await Promise.all([
      query.getMany(),
      query.getCount(),
    ]);

    return { total, data };
  }
}
