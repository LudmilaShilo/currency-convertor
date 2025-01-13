import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConversionResultSchema } from './api.schema';

export const ApiConvertCurrency = applyDecorators(
  ApiTags('currency'),
  ApiOperation({ summary: 'Convert amount from one currency to another' }),
  ApiResponse({
    status: 200,
    description: 'Currency converted successfully',
    type: ConversionResultSchema,
  }),
  ApiResponse({
    status: 400,
    description: 'Unsupported currency pair',
  }),
  ApiResponse({
    status: 503,
    description: 'Exchange rate service is temporarily unavailable',
  }),
);
