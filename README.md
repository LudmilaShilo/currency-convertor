# Currency Converter API

REST API for currency conversion using Monobank exchange rates.

## Key Features

- Currency conversion at current exchange rates
- Monitoring of bank's currency pairs updates
- Caching for performance optimization
- API protection against excessive requests
- Complete OpenAPI documentation

## API Documentation

The API documentation is available via Swagger. You can access it locally at:

**[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

## Deployment

To run the application locally, follow these steps:

1. Clone the repository:
   git clone https://github.com/vladyslav-kravchuk/currency-converter-api.git

2. Install dependencies:
   npm install

3. Start the local instance of Redis:
   docker run --name redis-currency-converter -p 6379:6379 -d redis:7.4.1

4. Run the application:
   npm run start:dev

## Testing

To run the tests, use the following command:

```bash
npm run test

npm run test:integration

npm run test:e2e
```
