import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { App } from 'supertest/types';
import { AppModule } from '@/http-server/app.module';
import { DataSource } from 'typeorm';
import { clearTables } from '@/utils/tests/clear-tables';
import { useCommonFiltersAndPipes } from '@/http-server/use-common-filters-and-pipes';
import { generateOrder } from '@/utils/tests/data-generators/orders.generator';
import { faker } from '@faker-js/faker';
import { Order } from './entities/order.entity';

describe('Modules / Orders', () => {
  let app: INestApplication<App>;
  let ds: DataSource;
  let httpServer: App;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    ds = app.get(DataSource);
    httpServer = app.getHttpServer();

    useCommonFiltersAndPipes(app);

    await app.init();
  });

  beforeEach(async () => {
    await clearTables(ds, ['orders']);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /orders', () => {
    describe('when doing validation', () => {
      it('should fail with invalid country', async () => {
        const newOrder = generateOrder({ country: 'XX' });

        const response = await request(httpServer)
          .post('/orders')
          .send(newOrder)
          .expect(400);

        expect(response.body.message).toContain(
          'Invalid ISO 3166 country code',
        );
      });

      it('should fail with invalid currency', async () => {
        const newOrder = generateOrder({ currency: 'XX' });

        const response = await request(httpServer)
          .post('/orders')
          .send(newOrder)
          .expect(400);

        expect(response.body.message).toContain(
          'Invalid ISO 4217 currency code',
        );
      });

      it('should fail with amount < 1', async () => {
        const newOrder = generateOrder({ amount: 0 });

        const response = await request(httpServer)
          .post('/orders')
          .send(newOrder)
          .expect(400);

        expect(response.body.message).toContain(
          'Amount must be at least 1 cent',
        );
      });

      it('should fail with past paymentDueDate', async () => {
        const newOrder = generateOrder({
          paymentDueDate: faker.date.recent(),
        });

        const response = await request(httpServer)
          .post('/orders')
          .send(newOrder)
          .expect(400);

        expect(response.body.message).toContain(
          'Payment due date must be in the future',
        );
      });

      it('should fail with missing required fields', async () => {
        const partialOrder = { ...generateOrder() };

        Reflect.deleteProperty(partialOrder, 'orderNumber');

        const response = await request(httpServer)
          .post('/orders')
          .send(partialOrder)
          .expect(400);

        expect(response.body.message).toContain(
          'orderNumber should not be empty',
        );
      });
    });

    describe('when producing results', () => {
      it('should create an order', async () => {
        const newOrder = generateOrder();

        const response = await request(httpServer)
          .post('/orders')
          .send(newOrder);

        expect(response.body).toEqual(expect.objectContaining(newOrder));
      });
    });
  });

  describe('GET /orders', () => {
    describe('when doing validation', () => {
      it('should find by paymentDescription (case-insensitive, partial)', async () => {
        const newOrder = generateOrder({
          paymentDescription: 'Special Product',
        });

        await request(httpServer).post('/orders').send(newOrder);

        const response = await request(httpServer)
          .get('/orders')
          .query({ paymentDescription: 'special' });

        expect(response.body.total).toBe(1);
        expect(response.body.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ paymentDescription: 'Special Product' }),
          ]),
        );
      });

      it('should respect limit and offset', async () => {
        await Promise.all([
          request(httpServer)
            .post('/orders')
            .send(generateOrder({ orderNumber: `ORD${1}` })),
          request(httpServer)
            .post('/orders')
            .send(generateOrder({ orderNumber: `ORD${2}` })),
        ]);

        const response1 = await request(httpServer)
          .get('/orders')
          .query({ limit: 2 });

        expect(response1.body.data.length).toEqual(2);

        const response2 = await request(httpServer)
          .get('/orders')
          .query({ limit: 1, offset: 1 });

        expect(response2.body.data.length).toBe(1);
      });

      it('should fail with invalid country in query', async () => {
        const response = await request(httpServer)
          .get('/orders')
          .query({ country: 'XX' })
          .expect(400);

        expect(response.body.message).toContain(
          'Invalid ISO 3166 country code',
        );
      });

      it('should fail with invalid limit', async () => {
        const response = await request(httpServer)
          .get('/orders')
          .query({ limit: -1 })
          .expect(400);

        expect(response.body.message).toContain(
          'limit must not be less than 1',
        );
      });

      it('should fail with invalid offset', async () => {
        const response = await request(httpServer)
          .get('/orders')
          .query({ offset: -1 })
          .expect(400);

        expect(response.body.message).toContain(
          'offset must not be less than 0',
        );
      });
    });

    describe('when producing results', () => {
      it('should find the order', async () => {
        const payload = { country: 'CD' };
        const newOrder = generateOrder(payload);

        const createResponse = await request(httpServer)
          .post('/orders')
          .send(newOrder);

        const findResponse = await request(httpServer)
          .get('/orders')
          .query({ ...payload });

        expect(findResponse.body).toEqual({
          total: 1,
          data: [createResponse.body],
        });
      });

      it('should always put EE country result on top', async () => {
        const orderEE = generateOrder({
          country: 'EE',
          orderNumber: 'EE-ORDER',
        });
        const orderCD = generateOrder({
          country: 'CD',
          orderNumber: 'CD-ORDER',
        });
        const orderUS = generateOrder({
          country: 'US',
          orderNumber: 'US-ORDER',
        });

        await Promise.all([
          request(httpServer).post('/orders').send(orderCD),
          request(httpServer).post('/orders').send(orderUS),
          request(httpServer).post('/orders').send(orderEE),
        ]);

        const response = await request(httpServer).get('/orders');
        const countries = (response.body.data as Order[]).map(
          (o: Order) => o.country,
        );
        expect(countries[0]).toBe('EE');
        expect(countries).toEqual(expect.arrayContaining(['EE', 'CD', 'US']));
      });
    });
  });
});
