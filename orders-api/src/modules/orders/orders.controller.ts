import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersQueryDto } from './dto/get-order-query.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll(@Query() query: GetOrdersQueryDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':orderNumber/exists')
  exists(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.exists(orderNumber);
  }
}
