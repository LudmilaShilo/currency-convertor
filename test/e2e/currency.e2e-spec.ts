import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Currency API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Allow time to connect to Redis and other services
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/currency/convert', () => {
    it('should convert USD to UAH', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/currency/convert')
        .send({
          sourceCurrency: 'USD',
          targetCurrency: 'UAH',
          amount: 100,
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        sourceCurrency: 'USD',
        targetCurrency: 'UAH',
        amount: 100,
      });
      expect(response.body).toHaveProperty('convertedAmount');
      expect(response.body).toHaveProperty('rate');
      expect(typeof response.body.convertedAmount).toBe('number');
      expect(typeof response.body.rate).toBe('number');
    });

    it('should handle invalid currency codes', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/currency/convert')
        .send({
          sourceCurrency: 'INVALID',
          targetCurrency: 'UAH',
          amount: 100,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message[0]).toContain(
        'Source currency must be one of:',
      );
    });

    it('should handle negative amounts', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/currency/convert')
        .send({
          sourceCurrency: 'USD',
          targetCurrency: 'UAH',
          amount: -100,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message[0]).toBe(
        'Amount must be a positive number greater than 0',
      );
    });

    it('should use cache for repeated conversions', async () => {
      const firstResponse = await request(app.getHttpServer())
        .post('/api/currency/convert')
        .send({
          sourceCurrency: 'USD',
          targetCurrency: 'UAH',
          amount: 100,
        });

      const secondResponse = await request(app.getHttpServer())
        .post('/api/currency/convert')
        .send({
          sourceCurrency: 'USD',
          targetCurrency: 'UAH',
          amount: 200,
        });

      expect(firstResponse.body.rate).toBe(secondResponse.body.rate);
      expect(secondResponse.body.convertedAmount).toBe(
        Number((200 * firstResponse.body.rate).toFixed(2)),
      );
    });
  });
});
