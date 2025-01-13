import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { EXCHANGE_RATE_PROVIDER } from '../../src/modules/exchange-fetcher/constants/tokens';

describe('CurrencyController (e2e)', () => {
  let app: INestApplication;

  const mockExchangeProvider = {
    fetchRate: jest.fn().mockResolvedValue(42.4702),
    fetchAllPairs: jest.fn().mockResolvedValue([
      { currencyCodeA: 840, currencyCodeB: 980 }, // USD/UAH
    ]),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EXCHANGE_RATE_PROVIDER)
      .useValue(mockExchangeProvider)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/currency/convert (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/currency/convert')
      .send({
        sourceCurrency: 'USD',
        targetCurrency: 'EUR',
        amount: 100,
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Bad Request');
    expect(response.body.message[0]).toBe('Target currency must: UAH');
  });

  it('/currency/convert (POST) success', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/currency/convert')
      .send({
        sourceCurrency: 'USD',
        targetCurrency: 'UAH',
        amount: 100,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('rate');
    expect(response.body).toHaveProperty('convertedAmount');
    expect(response.body.rate).toBe(42.4702);
    expect(response.body.convertedAmount).toBe(4247.02);
  });
});
